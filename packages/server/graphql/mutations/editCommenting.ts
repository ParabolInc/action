import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import {getUserId} from '../../utils/authorization'
import publish from '../../utils/publish'
import {GQLContext} from '../graphql'
import EditCommentingPayload from '../types/EditCommentingPayload'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'

export default {
  type: EditCommentingPayload,
  description: 'Track which users are commenting',
  args: {
    isCommenting: {
      type: GraphQLNonNull(GraphQLBoolean),
      description: 'True if the user is commenting, false if the user has stopped commenting'
    },
    meetingId: {
      type: GraphQLNonNull(GraphQLID)
    },
    threadId: {
      type: GraphQLNonNull(GraphQLID)
    }
  },
  resolve: async (
    _source,
    {isCommenting, meetingId, threadId},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const r = await getRethink()
    const viewerId = getUserId(authToken)
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    //AUTH
    const meetingMemberId = toTeamMemberId(meetingId, viewerId)
    const [meeting, viewerMeetingMember] = await Promise.all([
      r
        .table('NewMeeting')
        .get(meetingId)
        .run(),
      dataLoader.get('meetingMembers').load(meetingMemberId)
    ])

    if (!meeting) {
      return {error: {message: 'Meeting not found'}}
    }
    if (!viewerMeetingMember) {
      return {error: {message: `Not a part of the meeting`}}
    }

    // RESOLUTION
    const data = {
      commentorId: viewerId,
      isCommenting,
      meetingId,
      threadId
    }
    publish(SubscriptionChannel.MEETING, meetingId, 'EditCommentingPayload', data, subOptions)

    return data
  }
}
