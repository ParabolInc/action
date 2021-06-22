import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import defaultJiraProjectAvatar from '../../utils/defaultJiraProjectAvatar'
import {GQLContext} from '../graphql'
import JiraRemoteAvatarUrls from './JiraRemoteAvatarUrls'
import JiraRemoteProjectCategory from './JiraRemoteProjectCategory'

const JiraRemoteProject = new GraphQLObjectType<any, GQLContext>({
  name: 'JiraRemoteProject',
  description: 'A project fetched from Jira in real time',
  fields: () => ({
    id: {
      type: GraphQLNonNull(GraphQLID),
      resolve: ({cloudId, key}) => `${cloudId}:${key}`
    },
    self: {
      type: GraphQLNonNull(GraphQLID)
    },
    cloudId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The cloud ID that the project lives on. Does not exist on the Jira object!'
    },
    key: {
      type: GraphQLNonNull(GraphQLString)
    },
    name: {
      type: GraphQLNonNull(GraphQLString)
    },
    avatar: {
      type: GraphQLNonNull(GraphQLString),
      resolve: ({avatar}) => {
        return avatar || defaultJiraProjectAvatar
      }
    },
    avatarUrls: {
      type: GraphQLNonNull(JiraRemoteAvatarUrls)
    },
    projectCategory: {
      type: GraphQLNonNull(JiraRemoteProjectCategory)
    },
    simplified: {
      type: GraphQLNonNull(GraphQLBoolean)
    },
    style: {
      type: GraphQLNonNull(GraphQLString)
    }
  })
})

export default JiraRemoteProject
