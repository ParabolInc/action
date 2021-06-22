import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql'
import NewMeetingCheckInPayload from '../types/NewMeetingCheckInPayload'

export default {
  type: NewMeetingCheckInPayload,
  description: 'Check a member in as present or absent',
  deprecationReason: 'Members now join lazily and joining means they are present',
  args: {
    userId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the user being marked present or absent'
    },
    meetingId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the meeting currently in progress'
    },
    isCheckedIn: {
      type: GraphQLBoolean,
      description: 'true if the member is present, false if absent, null if undecided'
    }
  },
  async resolve(_source, {userId, meetingId}) {
    return {meetingId, userId}
  }
}
