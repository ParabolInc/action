import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import makeEmptyStr from '~/utils/draftjs/makeEmptyStr'
import createProxyRecord from '~/utils/relay/createProxyRecord'
import {AddCommentMutation_meeting} from '~/__generated__/AddCommentMutation_meeting.graphql'
import {SharedUpdater, StandardMutation} from '../types/relayMutations'
import {AddCommentMutation as TAddCommentMutation} from '../__generated__/AddCommentMutation.graphql'
import getThreadSourceThreadConn from './connections/getThreadSourceThreadConn'
import safePutNodeInConn from './handlers/safePutNodeInConn'
import addNodeToArray from '~/utils/relay/addNodeToArray'

graphql`
  fragment AddCommentMutation_meeting on AddCommentSuccess {
    comment {
      ...ThreadedItem_threadable
      threadSource
      threadId
      threadSortOrder
      threadParentId
    }
    meetingId
  }
`

const mutation = graphql`
  mutation AddCommentMutation($comment: AddCommentInput!, $meetingId: ID!) {
    addComment(comment: $comment, meetingId: $meetingId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...AddCommentMutation_meeting @relay(mask: false)
    }
  }
`

export const addCommentMeetingUpdater: SharedUpdater<AddCommentMutation_meeting> = (
  payload,
  {store}
) => {
  const meetingId = payload.getValue('meetingId')
  const meeting = store.get(meetingId)
  const isRightDrawerOpen = meeting?.getValue('isRightDrawerOpen')
  if (isRightDrawerOpen === false) {
    meeting?.setValue(true, 'isCommentUnread')
  }
  const comment = payload.getLinkedRecord('comment')
  if (!comment) return
  const threadParentId = comment.getValue('threadParentId')
  if (threadParentId) {
    addNodeToArray(comment, store.get(threadParentId), 'replies', 'threadSortOrder')
    return
  }
  const threadSourceId = comment.getValue('threadId')
  if (threadSourceId) {
    const threadSourceProxy = (threadSourceId && store.get(threadSourceId as string)) || null
    const threadSourceConn = getThreadSourceThreadConn(threadSourceProxy)
    safePutNodeInConn(threadSourceConn, comment, store, 'threadSortOrder', true)
  }
}

const AddCommentMutation: StandardMutation<TAddCommentMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TAddCommentMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('addComment')
      addCommentMeetingUpdater(payload as any, {atmosphere, store})
    },
    optimisticUpdater: (store) => {
      const {viewerId} = atmosphere
      const {comment} = variables
      const {isAnonymous} = comment
      const now = new Date().toJSON()
      const optimisticComment = createProxyRecord(store, 'Comment', {
        ...comment,
        createdAt: now,
        updatedAt: now,
        createdBy: isAnonymous ? null : viewerId,
        comtent: comment.content || makeEmptyStr(),
        isActive: true,
        isViewerComment: true
      })
        .setLinkedRecord(store.get(viewerId)!, 'user')
        .setLinkedRecords([], 'reactjis')
        .setLinkedRecords([], 'replies')
      if (!isAnonymous) {
        const viewer = store.getRoot().getLinkedRecord('viewer')
        optimisticComment.setLinkedRecord(viewer, 'createdByUser')
      }
      const payload = createProxyRecord(store, 'payload', {})
      payload.setLinkedRecord(optimisticComment, 'comment')
      addCommentMeetingUpdater(payload as any, {atmosphere, store})
    },
    onCompleted,
    onError
  })
}

export default AddCommentMutation
