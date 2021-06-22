import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import {getUserId} from '../../utils/authorization'
import publish from '../../utils/publish'
import {GQLContext} from '../graphql'
import DeleteCommentPayload from '../types/DeleteCommentPayload'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'

type DeleteCommentMutationVariables = {
  commentId: string
  meetingId: string
}

const deleteComment = {
  type: GraphQLNonNull(DeleteCommentPayload),
  description: `Delete a comment from a discussion`,
  args: {
    commentId: {
      type: GraphQLNonNull(GraphQLID)
    },
    meetingId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve: async (
    _source,
    {commentId, meetingId}: DeleteCommentMutationVariables,
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const r = await getRethink()
    const viewerId = getUserId(authToken)
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const now = new Date()

    //AUTH
    const comment = await r
      .table('Comment')
      .get(commentId)
      .run()
    if (!comment || !comment.isActive) {
      return {error: {message: 'Comment does not exist'}}
    }
    const meetingMemberId = toTeamMemberId(meetingId, viewerId)
    const viewerMeetingMember = await dataLoader.get('meetingMembers').load(meetingMemberId)
    if (!viewerMeetingMember) {
      return {error: {message: `Not a member of the meeting`}}
    }
    const {createdBy} = comment
    if (createdBy !== viewerId) {
      return {error: {message: 'Can only delete your own comment'}}
    }

    await r
      .table('Comment')
      .get(commentId)
      .update({isActive: false, updatedAt: now})
      .run()

    const data = {commentId}

    if (meetingId) {
      publish(SubscriptionChannel.MEETING, meetingId, 'DeleteCommentSuccess', data, subOptions)
    }
    return data
  }
}

export default deleteComment
