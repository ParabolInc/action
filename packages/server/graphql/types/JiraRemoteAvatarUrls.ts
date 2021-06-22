import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'

const JiraRemoteAvatarUrls = new GraphQLObjectType<any, GQLContext>({
  name: 'JiraRemoteAvatarUrls',
  description:
    'The URLs for avatars. NOTE: If they are custom, an Authorization header is required!',
  fields: () => ({
    x48: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: (source) => {
        return source['48x48']
      }
    },
    x24: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: (source) => {
        return source['24x24']
      }
    },
    x16: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: (source) => {
        return source['16x16']
      }
    },
    x32: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: (source) => {
        return source['32x32']
      }
    }
  })
})

export default JiraRemoteAvatarUrls
