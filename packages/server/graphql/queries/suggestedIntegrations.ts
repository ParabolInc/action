import {GraphQLNonNull} from 'graphql'
import ms from 'ms'
import {getUserId} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import SuggestedIntegrationQueryPayload from '../types/SuggestedIntegrationQueryPayload'
import fetchAllIntegrations from './helpers/fetchAllIntegrations'
import {
  getPermsByTaskService,
  getTeamIntegrationsByUserId,
  IntegrationByUserId,
  useOnlyUserIntegrations
} from './helpers/suggestedIntegrationHelpers'

export default {
  description: 'The integrations that the user would probably like to use',
  type: new GraphQLNonNull(SuggestedIntegrationQueryPayload),
  resolve: async ({teamId, userId}, _args, {authToken, dataLoader}: GQLContext) => {
    const viewerId = getUserId(authToken)

    // AUTH
    if (userId !== viewerId) {
      const user = await dataLoader.get('users').load(userId)
      const {tms} = user
      const onTeam = authToken.tms.find((teamId) => tms!.includes(teamId))
      if (!onTeam) {
        return standardError(new Error('Not on same team as user'), {userId: viewerId})
      }
    }
    const teamIntegrationsByUserId = await getTeamIntegrationsByUserId(teamId)

    // if the team has no integrations, return every possible integration for the user
    if (!teamIntegrationsByUserId.length) {
      const items = await fetchAllIntegrations(dataLoader, teamId, userId)
      return {items, hasMore: false}
    }
    const userIntegrationsForTeam = useOnlyUserIntegrations(teamIntegrationsByUserId, userId)
    if (userIntegrationsForTeam) {
      return {items: userIntegrationsForTeam, hasMore: true}
    }

    const permLookup = await getPermsByTaskService(dataLoader, teamId, userId)

    const aMonthAgo = new Date(Date.now() - ms('30d'))
    const recentUserIntegrations = teamIntegrationsByUserId.filter(
      (integration) => integration.userId === userId && integration.lastUsedAt >= aMonthAgo
    )

    const idSet = new Set()
    const dedupedTeamIntegrations = [] as IntegrationByUserId[]
    const userAndTeamItems = [...recentUserIntegrations, ...teamIntegrationsByUserId]
    // dedupes for perms, user vs team items, as well as possible name changes
    for (let i = 0; i < userAndTeamItems.length; i++) {
      const integration = userAndTeamItems[i]
      if (!permLookup[integration.service] || idSet.has(integration.id)) {
        continue
      }
      idSet.add(integration.id)
      dedupedTeamIntegrations.push(integration)
    }

    // if other users have items that the viewer can't access, revert back to fetching everything
    if (userAndTeamItems.length === 0) {
      const items = await fetchAllIntegrations(dataLoader, teamId, userId)
      return {items, hasMore: false}
    }
    return {hasMore: true, items: dedupedTeamIntegrations}
  }
}
