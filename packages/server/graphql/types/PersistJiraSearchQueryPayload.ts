import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import AtlassianIntegration from './AtlassianIntegration'
import makeMutationPayload from './makeMutationPayload'

export const PersistJiraSearchQuerySuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'PersistJiraSearchQuerySuccess',
  fields: () => ({
    atlassianIntegration: {
      type: AtlassianIntegration,
      description: 'The newly created auth',
      resolve: async ({atlassianAuthId}, _args, {dataLoader}) => {
        return dataLoader.get('atlassianAuths').load(atlassianAuthId)
      }
    }
  })
})

const PersistJiraSearchQueryPayload = makeMutationPayload(
  'PersistJiraSearchQueryPayload',
  PersistJiraSearchQuerySuccess
)

export default PersistJiraSearchQueryPayload
