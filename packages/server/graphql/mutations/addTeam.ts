import {GraphQLNonNull} from 'graphql'
import {SubscriptionChannel, Threshold} from 'parabol-client/types/constEnums'
import {SuggestedActionTypeEnum} from '../../../client/types/constEnums'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import AuthToken from '../../database/types/AuthToken'
import generateUID from '../../generateUID'
import removeSuggestedAction from '../../safeMutations/removeSuggestedAction'
import {getUserId, isUserInOrg} from '../../utils/authorization'
import encodeAuthToken from '../../utils/encodeAuthToken'
import publish from '../../utils/publish'
import segmentIo from '../../utils/segmentIo'
import standardError from '../../utils/standardError'
import rateLimit from '../rateLimit'
import AddTeamPayload from '../types/AddTeamPayload'
import NewTeamInput from '../types/NewTeamInput'
import addTeamValidation from './helpers/addTeamValidation'
import createTeamAndLeader from './helpers/createTeamAndLeader'
import {TierEnum} from '../../database/types/Invoice'
import getTeamsByOrgId from '../../postgres/queries/getTeamsByOrgId'

export default {
  type: new GraphQLNonNull(AddTeamPayload),
  description: 'Create a new team and add the first team member',
  args: {
    newTeam: {
      type: new GraphQLNonNull(NewTeamInput),
      description: 'The new team object'
    }
  },
  resolve: rateLimit({perMinute: 4, perHour: 20})(
    async (_source, args, {authToken, dataLoader, socketId: mutatorId}) => {
      const operationId = dataLoader.share()
      const subOptions = {mutatorId, operationId}

      // AUTH
      const {orgId} = args.newTeam
      const viewerId = getUserId(authToken)
      if (!(await isUserInOrg(viewerId, orgId))) {
        return standardError(new Error('Organization not found'), {userId: viewerId})
      }

      // VALIDATION
      const orgTeams = await getTeamsByOrgId(orgId, {isArchived: false})
      const orgTeamNames = orgTeams.map((team) => team.name)
      const {
        data: {newTeam},
        errors
      } = addTeamValidation(orgTeamNames)(args) as any
      if (Object.keys(errors).length) {
        if (errors.newTeam && errors.newTeam.name) {
          return {
            error: {
              message: errors.newTeam.name
            }
          }
        }
        return standardError(new Error('Failed input validation'), {userId: viewerId})
      }
      if (orgTeams.length >= Threshold.MAX_FREE_TEAMS) {
        const organization = await dataLoader.get('organizations').load(orgId)
        const {tier}: {tier: TierEnum} = organization
        if (tier === 'personal') {
          return standardError(new Error('Max free teams reached'), {userId: viewerId})
        }
      }

      // RESOLUTION
      const teamId = generateUID()
      await createTeamAndLeader(viewerId, {id: teamId, isOnboardTeam: false, ...newTeam})

      const {tms} = authToken
      // MUTATIVE
      tms.push(teamId)
      segmentIo.track({
        userId: viewerId,
        event: 'New Team',
        properties: {
          orgId,
          teamId,
          teamNumber: orgTeams.length + 1
        }
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
          'AddTeamPayload',
          {removedSuggestedActionId},
          subOptions
        )
      }
      publish(SubscriptionChannel.TEAM, viewerId, 'AddTeamPayload', data, subOptions)

      return {
        ...data,
        authToken: encodeAuthToken(new AuthToken({tms, sub: viewerId, rol: authToken.rol}))
      }
    }
  )
}
