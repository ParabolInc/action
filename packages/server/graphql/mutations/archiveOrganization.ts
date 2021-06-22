import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import safeArchiveTeam from '../../safeMutations/safeArchiveTeam'
import {getUserId, isSuperUser, isUserBillingLeader} from '../../utils/authorization'
import publish from '../../utils/publish'
import segmentIo from '../../utils/segmentIo'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import ArchiveOrganizationPayload from '../types/ArchiveOrganizationPayload'

export default {
  type: GraphQLNonNull(ArchiveOrganizationPayload),
  args: {
    orgId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The orgId to archive'
    }
  },
  async resolve(_source, {orgId}, {authToken, dataLoader, socketId: mutatorId}: GQLContext) {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const now = new Date()

    // AUTH
    const viewerId = getUserId(authToken)
    if (!isSuperUser(authToken)) {
      if (!(await isUserBillingLeader(viewerId, orgId, dataLoader))) {
        return standardError(new Error('Not organization leader'), {userId: viewerId})
      }
    }

    const organization = await dataLoader.get('organizations').load(orgId)
    const {tier} = organization
    if (tier !== 'personal') {
      return standardError(new Error('You must first downgrade before archiving'), {
        userId: viewerId
      })
    }

    // RESOLUTION
    segmentIo.track({
      userId: viewerId,
      event: 'Archive Organization',
      properties: {
        orgId
      }
    })
    const teams = await dataLoader.get('teamsByOrgId').load(orgId)
    const teamIds = teams.map(({id}) => id)
    const teamArchiveResults = (await Promise.all(
      teamIds.map((teamId) => safeArchiveTeam(teamId))
    )) as any
    const allRemovedSuggestedActionIds = [] as string[]
    const allUserIds = [] as string[]

    teamArchiveResults.forEach(({team, users, removedSuggestedActionIds}) => {
      if (!team) return
      const userIds = users.map(({id}) => id)
      allUserIds.push(...userIds)
      allRemovedSuggestedActionIds.push(...removedSuggestedActionIds)
    })

    const uniqueUserIds = Array.from(new Set(allUserIds))

    await r
      .table('OrganizationUser')
      .getAll(orgId, {index: 'orgId'})
      .filter({removedAt: null})
      .update({
        removedAt: now
      })
      .run()

    const data = {
      orgId,
      teamIds,
      removedSuggestedActionIds: allRemovedSuggestedActionIds
    }
    publish(SubscriptionChannel.ORGANIZATION, orgId, 'ArchiveOrganizationPayload', data, subOptions)
    const users = await dataLoader.get('users').loadMany(uniqueUserIds)
    users.forEach((user) => {
      const {id, tms} = user
      publish(SubscriptionChannel.NOTIFICATION, id, 'AuthTokenPayload', {tms})
    })

    return data
  }
}
