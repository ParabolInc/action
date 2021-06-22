import {GraphQLList, GraphQLObjectType} from 'graphql'
import db from '../../db'
import {getUserId} from '../../utils/authorization'
import {GQLContext} from '../graphql'
import StandardMutationError from './StandardMutationError'
import User from './User'

const AddFeatureFlagPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'AddFeatureFlagPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    user: {
      type: User,
      description:
        'the user that was given the super power. Use users instead in GraphiQL since it may affect multiple users',
      resolve: (_source, _args, {authToken}) => {
        const viewerId = getUserId(authToken)
        return db.read('User', viewerId)
      }
    },
    users: {
      type: new GraphQLList(User),
      description: 'the users given the super power',
      resolve: ({userIds}, _args, {dataLoader}) => {
        return dataLoader.get('users').loadMany(userIds)
      }
    }
  })
})

export default AddFeatureFlagPayload
