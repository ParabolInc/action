import {GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {SuggestedActionTypeEnum} from '../../../client/types/constEnums'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import AuthToken from '../../database/types/AuthToken'
import db from '../../db'
import generateUID from '../../generateUID'
import removeSuggestedAction from '../../safeMutations/removeSuggestedAction'
import {getUserId} from '../../utils/authorization'
import encodeAuthToken from '../../utils/encodeAuthToken'
import publish from '../../utils/publish'
import segmentIo from '../../utils/segmentIo'
import standardError from '../../utils/standardError'
import rateLimit from '../rateLimit'
import AddOrgPayload from '../types/AddOrgPayload'
import NewTeamInput from '../types/NewTeamInput'
import addOrgValidation from './helpers/addOrgValidation'
import createNewOrg from './helpers/createNewOrg'
import createTeamAndLeader from './helpers/createTeamAndLeader'

export default {
  type: new GraphQLNonNull(AddOrgPayload),
  description: 'Create a new team and add the first team member',
  args: {
    newTeam: {
      type: new GraphQLNonNull(NewTeamInput),
      description: 'The new team object with exactly 1 team member'
    },
    orgName: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of the new team'
    }
  },
  resolve: rateLimit({perMinute: 2, perHour: 8})(
    async (_source, args, {authToken, dataLoader, socketId: mutatorId}) => {
      const operationId = dataLoader.share()
      const subOptions = {mutatorId, operationId}

      // AUTH
      const viewerId = getUserId(authToken)

      // VALIDATION
      const {
        data: {newTeam, orgName},
        errors
      } = addOrgValidation()(args) as any
      if (Object.keys(errors).length) {
        return standardError(new Error('Failed input validation'), {userId: viewerId})
      }

      // RESOLUTION
      const orgId = generateUID()
      const teamId = generateUID()
      const user = await db.read('User', viewerId)
      const {email} = user
      await createNewOrg(orgId, orgName, viewerId, email)
      await createTeamAndLeader(viewerId, {id: teamId, orgId, isOnboardTeam: false, ...newTeam})

      const {tms} = authToken
      // MUTATIVE
      tms.push(teamId)
      segmentIo.track({
        userId: viewerId,
        event: 'New Org',
        properties: {orgId, teamId, fromSignup: false}
      })
      publish(SubscriptionChannel.NOTIFICATION, viewerId, 'AuthTokenPayload', {tms})

      const teamMemberId = toTeamMemberId(teamId, viewerId)
      const data = {
        orgId,
        teamId,
        teamMemberId
      }

      const removedSuggestedActionId = await removeSuggestedAction(
        viewerId,
        SuggestedActionTypeEnum.createNewTeam
      )
      if (removedSuggestedActionId) {
        publish(
          SubscriptionChannel.NOTIFICATION,
          viewerId,
          'AddOrgPayload',
          {removedSuggestedActionId},
          subOptions
        )
      }
      publish(SubscriptionChannel.ORGANIZATION, viewerId, 'AddOrgPayload', data, subOptions)

      return {
        ...data,
        authToken: encodeAuthToken(new AuthToken({tms, sub: viewerId, rol: authToken.rol}))
      }
    }
  )
}
