import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList
} from 'graphql'
import {GQLContext} from '../graphql'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import TeamMember from './TeamMember'
import ThreadSource, {threadSourceFields} from './ThreadSource'
import CommentorDetails from './CommentorDetails'

const AgendaItem = new GraphQLObjectType<any, GQLContext>({
  name: 'AgendaItem',
  description: 'A request placeholder that will likely turn into 1 or more tasks',
  interfaces: () => [ThreadSource],
  fields: () => ({
    ...threadSourceFields(),
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The unique agenda item id teamId::shortid'
    },
    commentors: {
      type: new GraphQLList(new GraphQLNonNull(CommentorDetails)),
      description: 'A list of users currently commenting',
      resolve: ({commentors = []}) => {
        return commentors
      }
    },
    content: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The body of the agenda item'
    },
    createdAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the agenda item was created'
    },
    isActive: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if the agenda item has not been processed or deleted',
      resolve: ({isActive}) => !!isActive
    },
    pinned: {
      type: GraphQLBoolean,
      description: 'True if the agenda item has been pinned'
    },
    pinnedParentId: {
      type: GraphQLID,
      description: 'If pinned, this is the unique id of the original agenda item'
    },
    sortOrder: {
      type: new GraphQLNonNull(GraphQLFloat),
      description: 'The sort order of the agenda item in the list'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: '*The team for this agenda item'
    },
    teamMemberId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The teamMemberId that created this agenda item'
    },
    meetingId: {
      type: GraphQLID,
      description: 'The meetingId of the agenda item'
    },
    updatedAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the agenda item was updated'
    },
    teamMember: {
      type: new GraphQLNonNull(TeamMember),
      description: 'The team member that created the agenda item',
      resolve: async ({teamMemberId}, _args, {dataLoader}) => {
        return dataLoader.get('teamMembers').load(teamMemberId)
      }
    }
  })
})

export default AgendaItem
