import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLString} from 'graphql'
import {InvoiceItemType} from 'parabol-client/types/constEnums'
import adjustUserCount from '../../billing/helpers/adjustUserCount'
import getRethink from '../../database/rethinkDriver'
import Notification from '../../database/types/Notification'
import Organization from '../../database/types/Organization'
import Team from '../../database/types/Team'
import db from '../../db'
import safeArchiveEmptyPersonalOrganization from '../../safeMutations/safeArchiveEmptyPersonalOrganization'
import {getUserId, isSuperUser} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import updateTeamByTeamId from '../../postgres/queries/updateTeamByTeamId'
import getTeamByTeamId from '../../postgres/queries/getTeamByTeamId'

const moveToOrg = async (teamId: string, orgId: string, authToken: any) => {
  const r = await getRethink()
  // AUTH
  const su = isSuperUser(authToken)
  // VALIDATION
  const [{org}, team] = await Promise.all([
    r({
      org: (r.table('Organization').get(orgId) as unknown) as Organization
    }).run(),
    getTeamByTeamId(teamId)
  ])
  const {orgId: currentOrgId} = team
  if (!su) {
    const userId = getUserId(authToken)
    if (!userId) {
      return standardError(new Error('No userId provided'))
    }
    const newOrganizationUser = await r
      .table('OrganizationUser')
      .getAll(userId, {index: 'userId'})
      .filter({orgId, removedAt: null})
      .nth(0)
      .default(null)
      .run()
    if (!newOrganizationUser) {
      return standardError(new Error('Not on organization'), {userId})
    }
    const isBillingLeaderForOrg = newOrganizationUser.role === 'BILLING_LEADER'
    if (!isBillingLeaderForOrg) {
      return standardError(new Error('Not organization leader'), {userId})
    }
    const oldOrganizationUser = await r
      .table('OrganizationUser')
      .getAll(userId, {index: 'userId'})
      .filter({orgId: currentOrgId, removedAt: null})
      .nth(0)
      .run()
    const isBillingLeaderForTeam = oldOrganizationUser.role === 'BILLING_LEADER'
    if (!isBillingLeaderForTeam) {
      return standardError(new Error('Not organization leader'), {userId})
    }

    if (orgId === currentOrgId) {
      return standardError(new Error('Team already on organization'), {userId})
    }
  }

  // RESOLUTION
  const [rethinkResult] = await Promise.all([
    r({
      notifications: (r
        .table('Notification')
        .filter({teamId})
        .filter((notification) =>
          notification('orgId')
            .default(null)
            .ne(null)
        )
        .update({orgId}) as unknown) as Notification[],
      templates: r
        .table('MeetingTemplate')
        .getAll(currentOrgId, {index: 'orgId'})
        .update({
          orgId
        }),
      team: (r
        .table('Team')
        .get(teamId)
        .update({
          orgId,
          isPaid: Boolean(org.stripeSubscriptionId),
          tier: org.tier
        }) as unknown) as Team,
      newToOrgUserIds: (r
        .table('TeamMember')
        .getAll(teamId, {index: 'teamId'})
        .filter({isNotRemoved: true})
        .filter((teamMember) => {
          return r
            .table('OrganizationUser')
            .getAll(teamMember('userId'), {index: 'userId'})
            .filter({orgId, removedAt: null})
            .count()
            .eq(0)
        })('userId')
        .coerceTo('array') as unknown) as string[]
    }).run(),
    updateTeamByTeamId(
      {
        orgId,
        isPaid: Boolean(org.stripeSubscriptionId),
        tier: org.tier
      },
      teamId
    )
  ])
  const {newToOrgUserIds} = rethinkResult

  // if no teams remain on the org, remove it
  await safeArchiveEmptyPersonalOrganization(currentOrgId)

  await Promise.all(
    newToOrgUserIds.map((newUserId) => {
      return adjustUserCount(newUserId, orgId, InvoiceItemType.ADD_USER)
    })
  )

  const newUsers = await db.readMany('User', newToOrgUserIds)

  const inactiveUserIds = newUsers.filter((user) => user.inactive).map(({id}) => id)
  inactiveUserIds.map((newInactiveUserId) => {
    return adjustUserCount(newInactiveUserId, orgId, InvoiceItemType.AUTO_PAUSE_USER)
  })

  const inactiveAdded = inactiveUserIds.length
  const activeAdded = newToOrgUserIds.length - inactiveAdded
  return `${teamId}: ${inactiveAdded} inactive users and ${activeAdded} active users added to org ${orgId}`
}

export default {
  type: GraphQLString,
  description: 'Move a team to a different org. Requires billing leader rights on both orgs!',
  args: {
    teamIds: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID))),
      description: 'The teamId that you want to move'
    },
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The ID of the organization you want to move the team to'
    }
  },
  async resolve(_source, {teamIds, orgId}, {authToken}) {
    const results = [] as (string | any)[]
    for (let i = 0; i < teamIds.length; i++) {
      const teamId = teamIds[i]
      const result = await moveToOrg(teamId, orgId, authToken)
      results.push(result)
    }
    const successes = results.filter((result) => typeof result === 'string')
    const failures = results.filter((result) => typeof result !== 'string')
    const successStr = successes.join('\n')
    console.error('failures', failures)
    return successStr
  }
}
