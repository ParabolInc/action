import {GraphQLBoolean, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import MeetingMember, {meetingMemberFields} from './MeetingMember'

const PokerMeetingMember = new GraphQLObjectType<any, GQLContext>({
  name: 'PokerMeetingMember',
  interfaces: () => [MeetingMember],
  description: 'All the meeting specifics for a user in a poker meeting',
  fields: () => ({
    ...meetingMemberFields(),
    isSpectating: {
      type: GraphQLNonNull(GraphQLBoolean),
      description:
        'true if the user is not voting and does not want their vote to count towards aggregates'
    }
  })
})

export default PokerMeetingMember
