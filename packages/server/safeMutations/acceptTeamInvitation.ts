import {InvoiceItemType} from 'parabol-client/types/constEnums'
import adjustUserCount from '../billing/helpers/adjustUserCount'
import getRethink from '../database/rethinkDriver'
import OrganizationUser from '../database/types/OrganizationUser'
import SuggestedActionCreateNewTeam from '../database/types/SuggestedActionCreateNewTeam'
import User from '../database/types/User'
import generateUID from '../generateUID'
import getNewTeamLeadUserId from '../safeQueries/getNewTeamLeadUserId'
import setUserTierForUserIds from '../utils/setUserTierForUserIds'
import addTeamIdToTMS from './addTeamIdToTMS'
import insertNewTeamMember from './insertNewTeamMember'
import getTeamByTeamId from '../postgres/queries/getTeamByTeamId'

const handleFirstAcceptedInvitation = async (team): Promise<string | null> => {
  const r = await getRethink()
  const now = new Date()
  const {id: teamId, isOnboardTeam} = team
  if (!isOnboardTeam) return null
  const newTeamLeadUserId = await getNewTeamLeadUserId(teamId)
  if (newTeamLeadUserId) {
    await r
      .table('SuggestedAction')
      .insert([
        {
          id: generateUID(),
          createdAt: now,
          priority: 3,
          removedAt: null,
          teamId,
          type: 'tryRetroMeeting',
          userId: newTeamLeadUserId
        },
        new SuggestedActionCreateNewTeam({userId: newTeamLeadUserId}),
        {
          id: generateUID(),
          createdAt: now,
          priority: 5,
          removedAt: null,
          teamId,
          type: 'tryActionMeeting',
          userId: newTeamLeadUserId
        }
      ])
      .run()
  }
  return newTeamLeadUserId
}

const acceptTeamInvitation = async (teamId: string, userId: string) => {
  const r = await getRethink()
  const now = new Date()
  const [{user}, team] = await Promise.all([
    r({
      user: (r
        .table('User')
        .get(userId)
        .merge({
          organizationUsers: r
            .table('OrganizationUser')
            .getAll(userId, {index: 'userId'})
            .filter({removedAt: null})
            .coerceTo('array')
        }) as unknown) as User & {organizationUsers: OrganizationUser[]}
    }).run(),
    getTeamByTeamId(teamId)
  ])
  const {orgId} = team
  const {email, organizationUsers} = user
  const teamLeadUserIdWithNewActions = await handleFirstAcceptedInvitation(team)
  const userInOrg = !!organizationUsers.find((organizationUser) => organizationUser.orgId === orgId)
  const [, invitationNotificationIds] = await Promise.all([
    insertNewTeamMember(userId, teamId),
    r
      .table('Notification')
      .getAll(userId, {index: 'userId'})
      .filter({
        type: 'TEAM_INVITATION',
        teamId
      })
      .update(
        // not really clicked, but no longer important
        {status: 'CLICKED'},
        {returnChanges: true}
      )('changes')('new_val')('id')
      .default([])
      .run(),
    // add the team to the user doc
    addTeamIdToTMS(userId, teamId),
    r
      .table('TeamInvitation')
      .getAll(teamId, {index: 'teamId'})
      // redeem all invitations, otherwise if they have 2 someone could join after they've been kicked out
      .filter({email})
      .update({
        acceptedAt: now,
        acceptedBy: userId
      })
      .run()
  ])

  if (!userInOrg) {
    try {
      await adjustUserCount(userId, orgId, InvoiceItemType.ADD_USER)
    } catch (e) {
      console.log(e)
    }
    await setUserTierForUserIds([userId])
  }

  // if accepted to team, don't count it towards the global denial count
  await r
    .table('PushInvitation')
    .getAll(userId, {index: 'userId'})
    .filter({teamId})
    .delete()
    .run()
  return {
    teamLeadUserIdWithNewActions,
    invitationNotificationIds: invitationNotificationIds as string[]
  }
}

export default acceptTeamInvitation
