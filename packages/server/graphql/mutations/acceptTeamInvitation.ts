import {GraphQLID, GraphQLNonNull} from 'graphql'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import {InvitationTokenError, SubscriptionChannel} from '../../../client/types/constEnums'
import AuthToken from '../../database/types/AuthToken'
import acceptTeamInvitation from '../../safeMutations/acceptTeamInvitation'
import {getUserId, isAuthenticated} from '../../utils/authorization'
import encodeAuthToken from '../../utils/encodeAuthToken'
import publish from '../../utils/publish'
import RedisLock from '../../utils/RedisLock'
import segmentIo from '../../utils/segmentIo'
import rateLimit from '../rateLimit'
import AcceptTeamInvitationPayload from '../types/AcceptTeamInvitationPayload'
import handleInvitationToken from './helpers/handleInvitationToken'

export default {
  type: new GraphQLNonNull(AcceptTeamInvitationPayload),
  description: `Redeem an invitation token for a logged in user`,
  args: {
    invitationToken: {
      type: GraphQLID,
      description:
        'The 48-byte hex encoded invitation token or the 2-part JWT for mass invitation tokens'
    },
    notificationId: {
      type: GraphQLID,
      description: 'the notification clicked to accept, if any'
    }
  },
  // rate limited because a notificationId subverts the expiration of the token & we don't want any brute forces for expired tokens
  resolve: rateLimit({
    perMinute: 50,
    perHour: 100
  })(
    async (
      _source,
      {invitationToken, notificationId},
      {authToken, dataLoader, socketId: mutatorId}
    ) => {
      const operationId = dataLoader.share()
      const subOptions = {mutatorId, operationId}

      // AUTH
      const viewerId = getUserId(authToken)
      if (!isAuthenticated(authToken)) {
        return {
          error: {message: 'Not authenticated'}
        }
      }
      if (!invitationToken) {
        return {
          error: {
            message: 'No invitation token provided'
          }
        }
      }

      // VALIDATION
      const invitationRes = await handleInvitationToken(
        invitationToken,
        viewerId,
        dataLoader,
        notificationId
      )
      if (invitationRes.error) {
        const {error: message, teamId, meetingId} = invitationRes
        if (message === InvitationTokenError.ALREADY_ACCEPTED) {
          return {error: {message}, teamId, meetingId}
        }
        return {error: {message}}
      }

      const {invitation} = invitationRes
      const {meetingId, teamId} = invitation
      const meeting = meetingId ? await dataLoader.get('newMeetings').load(meetingId) : null
      const activeMeetingId = meeting && !meeting.endedAt ? meetingId : null
      const team = await dataLoader.get('teams').load(teamId)
      const {orgId} = team

      // make sure that same invite can't be accepted at the same moment
      const ttl = 3000
      const redisLock = new RedisLock(`acceptTeamInvitation:${viewerId}:${orgId}`, ttl)
      const lockTTL = await redisLock.checkLock()
      if (lockTTL > 0) {
        return {
          error: {message: `You already called this ${ttl - lockTTL}ms ago!`}
        }
      }

      // RESOLUTION
      const {teamLeadUserIdWithNewActions, invitationNotificationIds} = await acceptTeamInvitation(
        teamId,
        viewerId
      )
      await redisLock.unlock()
      const tms = authToken.tms ? authToken.tms.concat(teamId) : [teamId]
      // IMPORTANT! mutate the current authToken so any queries or subscriptions can get the latest
      authToken.tms = tms
      const teamMemberId = toTeamMemberId(teamId, viewerId)

      const data = {
        meetingId: activeMeetingId,
        teamId,
        teamMemberId,
        invitationNotificationIds
      }

      const encodedAuthToken = encodeAuthToken(
        new AuthToken({tms, sub: viewerId, rol: authToken.rol})
      )

      // Send the new team member a welcome & a new token
      publish(SubscriptionChannel.NOTIFICATION, viewerId, 'AuthTokenPayload', {tms})

      // remove the old notifications
      if (invitationNotificationIds.length > 0) {
        publish(
          SubscriptionChannel.NOTIFICATION,
          viewerId,
          'AcceptTeamInvitationPayload',
          data,
          subOptions
        )
      }

      // Tell the rest of the team about the new team member
      publish(SubscriptionChannel.TEAM, teamId, 'AcceptTeamInvitationPayload', data, subOptions)

      // Give the team lead new suggested actions
      if (teamLeadUserIdWithNewActions) {
        // the team lead just needs data about themselves. alternatively we could make an eg AcceptTeamInvitationTeamLeadPayload, but nulls are just as good
        publish(
          SubscriptionChannel.NOTIFICATION,
          teamLeadUserIdWithNewActions,
          'AcceptTeamInvitationPayload',
          {teamLeadId: teamLeadUserIdWithNewActions},
          subOptions
        )
      }
      segmentIo.track({
        userId: viewerId,
        event: 'Invite Accepted',
        properties: {teamId}
      })
      return {
        ...data,
        authToken: encodedAuthToken
      }
    }
  )
}
