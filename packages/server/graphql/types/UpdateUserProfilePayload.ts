import {GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import User from './User'
import {resolveUser} from '../resolvers'
import TeamMember from './TeamMember'
import StandardMutationError from './StandardMutationError'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import {GQLContext} from '../graphql'

const UpdateUserProfilePayload = new GraphQLObjectType<any, GQLContext>({
  name: 'UpdateUserProfilePayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    user: {
      type: User,
      resolve: resolveUser
    },
    teamMembers: {
      type: new GraphQLList(new GraphQLNonNull(TeamMember)),
      description: 'The updated team member',
      resolve: ({teamIds, userId}, _args, {dataLoader}) => {
        if (!teamIds) return []
        const teamMemberIds = teamIds.map((teamId) => toTeamMemberId(teamId, userId))
        return dataLoader.get('teamMembers').loadMany(teamMemberIds)
      }
    }
  })
})

export default UpdateUserProfilePayload
