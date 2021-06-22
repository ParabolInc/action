import {GraphQLID, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import TeamInvitation from './TeamInvitation'

const TeamInvitationPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'TeamInvitationPayload',
  description: 'The response to a teamInvitation query',
  fields: () => ({
    teamInvitation: {
      type: TeamInvitation,
      description: 'The team invitation, if any'
    },
    teamId: {
      type: GraphQLID,
      description: 'the teamId of the team trying to join'
    },
    meetingId: {
      type: GraphQLID,
      description: 'one of the active meetings trying to join'
    }
  })
})

export default TeamInvitationPayload
