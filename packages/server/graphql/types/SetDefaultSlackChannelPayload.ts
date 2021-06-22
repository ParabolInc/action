import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'
import TeamMember from './TeamMember'

export const SetDefaultSlackChannelSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'SetDefaultSlackChannelSuccess',
  fields: () => ({
    slackChannelId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The id of the slack channel that is now the default slack channel'
    },
    teamMember: {
      type: GraphQLNonNull(TeamMember),
      description: 'The team member with the updated slack channel',
      resolve: ({teamId, userId}, _args, {dataLoader}) => {
        const teamMemberId = toTeamMemberId(teamId, userId)
        return dataLoader.get('teamMembers').load(teamMemberId)
      }
    }
  })
})

const SetDefaultSlackChannelPayload = makeMutationPayload(
  'SetDefaultSlackChannelPayload',
  SetDefaultSlackChannelSuccess
)

export default SetDefaultSlackChannelPayload
