import {GraphQLObjectType} from 'graphql'
import StandardMutationError from './StandardMutationError'
import SlackIntegration from './SlackIntegration'
import User from './User'
import {GQLContext} from '../graphql'

const AddSlackAuthPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'AddSlackAuthPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    slackIntegration: {
      type: SlackIntegration,
      description: 'The newly created auth',
      resolve: async ({slackAuthId}, _args, {dataLoader}: GQLContext) => {
        return dataLoader.get('slackAuths').load(slackAuthId)
      }
    },
    user: {
      type: User,
      description: 'The user with updated slackAuth',
      resolve: ({userId}, _args, {dataLoader}) => {
        return dataLoader.get('users').load(userId)
      }
    }
  })
})

export default AddSlackAuthPayload
