import dns, {MxRecord} from 'dns'
import promisify from 'es6-promisify'
import {GraphQLID, GraphQLNonNull} from 'graphql'
import {InvitationTokenError} from 'parabol-client/types/constEnums'
import {AuthIdentityTypeEnum} from '../../../client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import User from '../../database/types/User'
import db from '../../db'
import getBestInvitationMeeting from '../../utils/getBestInvitationMeeting'
import getSAMLURLFromEmail from '../../utils/getSAMLURLFromEmail'
import {GQLContext} from '../graphql'
import rateLimit from '../rateLimit'
import VerifiedInvitationPayload from '../types/VerifiedInvitationPayload'
import getTeamByTeamId from '../../postgres/queries/getTeamByTeamId'

const resolveMx = promisify(dns.resolveMx, dns)

const getIsGoogleProvider = async (user: User | null, email: string) => {
  const identities = user?.identities
  if (identities) {
    return !!identities.find((identity) => identity.type === AuthIdentityTypeEnum.GOOGLE)
  }
  const [, domain] = email.split('@')
  let res
  try {
    res = await resolveMx(domain)
  } catch (e) {
    return false
  }
  const [mxRecord] = res as MxRecord[]
  const exchange = (mxRecord && mxRecord.exchange) || ''
  return exchange.toLowerCase().endsWith('google.com')
}

export default {
  type: new GraphQLNonNull(VerifiedInvitationPayload),
  args: {
    token: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The invitation token'
    }
  },
  resolve: rateLimit({perMinute: 60, perHour: 1800})(
    async (_source, {token}, {dataLoader}: GQLContext) => {
      const r = await getRethink()
      const now = new Date()
      const teamInvitation = await r
        .table('TeamInvitation')
        .getAll(token, {index: 'token'})
        .nth(0)
        .default(null)
        .run()
      if (!teamInvitation) return {errorType: InvitationTokenError.NOT_FOUND}
      const {
        email,
        acceptedAt,
        expiresAt,
        invitedBy,
        meetingId: maybeMeetingId,
        teamId
      } = teamInvitation
      const [team, inviter] = await Promise.all([
        getTeamByTeamId(teamId),
        db.read('User', invitedBy)
      ])
      const bestMeeting = await getBestInvitationMeeting(teamId, maybeMeetingId, dataLoader)
      const meetingType = bestMeeting?.meetingType ?? null
      const meetingId = bestMeeting?.id ?? null
      const meetingName = bestMeeting?.name ?? null
      if (acceptedAt) {
        return {
          errorType: InvitationTokenError.ALREADY_ACCEPTED,
          teamName: team.name,
          meetingName,
          meetingId,
          meetingType,
          inviterName: inviter.preferredName,
          inviterEmail: inviter.email,
          teamInvitation
        }
      }

      if (expiresAt < now) {
        return {
          errorType: InvitationTokenError.EXPIRED,
          teamName: team.name,
          inviterName: inviter.preferredName,
          inviterEmail: inviter.email
        }
      }

      const viewer = (await r
        .table('User')
        .getAll(email, {index: 'email'})
        .nth(0)
        .default(null)
        .run()) as User | null
      const userId = viewer?.id ?? null
      const ssoURL = await getSAMLURLFromEmail(email, true)
      const isGoogle = await getIsGoogleProvider(viewer, email)
      return {
        ssoURL,
        teamName: team.name,
        meetingType,
        inviterName: inviter.preferredName,
        inviterEmail: inviter.email,
        teamInvitation,
        isGoogle,
        userId
      }
    }
  )
}
