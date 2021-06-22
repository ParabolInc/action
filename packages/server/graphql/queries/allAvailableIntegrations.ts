import {GraphQLList, GraphQLNonNull} from 'graphql'
import {getUserId} from '../../utils/authorization'
import {GQLContext} from '../graphql'
import SuggestedIntegration from '../types/SuggestedIntegration'
import fetchAllIntegrations from './helpers/fetchAllIntegrations'

export default {
  description: 'All the integrations that the user could possibly use',
  type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(SuggestedIntegration))),
  resolve: async ({teamId, userId}, _args, {authToken, dataLoader}: GQLContext) => {
    const viewerId = getUserId(authToken)

    // AUTH
    if (userId !== viewerId) {
      const user = await dataLoader.get('users').load(userId)
      const {tms} = user
      const onTeam = authToken.tms.find((teamId) => tms!.includes(teamId))
      if (!onTeam) {
        return []
      }
    }
    return fetchAllIntegrations(dataLoader, teamId, userId)
  }
}
