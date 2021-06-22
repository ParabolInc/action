import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import convertToTaskContent from '~/utils/draftjs/convertToTaskContent'
import safeRemoveNodeFromConn from '~/utils/relay/safeRemoveNodeFromConn'
import {DeleteCommentMutation_meeting} from '~/__generated__/DeleteCommentMutation_meeting.graphql'
import {SharedUpdater, SimpleMutation} from '../types/relayMutations'
import {DeleteCommentMutation as TDeleteCommentMutation} from '../__generated__/DeleteCommentMutation.graphql'
import getThreadSourceThreadConn from './connections/getThreadSourceThreadConn'
import safeRemoveNodeFromArray from '~/utils/relay/safeRemoveNodeFromArray'
import {RecordSourceSelectorProxy} from 'relay-runtime'

graphql`
  fragment DeleteCommentMutation_meeting on DeleteCommentSuccess {
    comment {
      id
      isActive
      content
      threadParentId
      threadId
      threadSource
    }
  }
`

const mutation = graphql`
  mutation DeleteCommentMutation($commentId: ID!, $meetingId: ID!) {
    deleteComment(commentId: $commentId, meetingId: $meetingId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...DeleteCommentMutation_meeting @relay(mask: false)
    }
  }
`

export const handleRemoveReply = (
  nodeId: string,
  threadParentId: string,
  store: RecordSourceSelectorProxy
) => {
  // delete w/o tombstone
  const threadParent = store.get(threadParentId)
  if (!threadParent) return
  safeRemoveNodeFromArray(nodeId, threadParent, 'replies')
  const isParentActive = threadParent.getValue('isActive')
  const isParentComment = threadParent.getValue('__typename') === 'Comment'
  if (isParentComment && !isParentActive) {
    handleDeleteComment(threadParent, store)
  }
}

const handleDeleteComment = (comment, store) => {
  const commentId = comment.getValue('id')
  const replies = comment.getLinkedRecords('replies')
  const threadParentId = comment.getValue('threadParentId')
  if (threadParentId) {
    handleRemoveReply(commentId, threadParentId, store)
    return
  }
  if (replies && replies.length > 0) {
    const TOMBSTONE = convertToTaskContent('[deleted]')
    comment.setValue(TOMBSTONE, 'content')
    comment.setValue(false, 'isActive')
  } else {
    const threadSourceId = comment.getValue('threadId')
    if (threadSourceId) {
      const threadSourceProxy = (threadSourceId && store.get(threadSourceId as string)) || null
      const threadSourceConn = getThreadSourceThreadConn(threadSourceProxy)
      safeRemoveNodeFromConn(commentId, threadSourceConn)
    }
  }
}

export const deleteCommentMeetingUpdater: SharedUpdater<DeleteCommentMutation_meeting> = (
  payload,
  {store}
) => {
  const comment = payload.getLinkedRecord('comment')
  if (!comment) return
  handleDeleteComment(comment, store)
}

const DeleteCommentMutation: SimpleMutation<TDeleteCommentMutation> = (atmosphere, variables) => {
  return commitMutation<TDeleteCommentMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('deleteComment')
      deleteCommentMeetingUpdater(payload as any, {atmosphere, store})
    },
    optimisticUpdater: (store) => {
      const {commentId} = variables
      const comment = store.get(commentId)
      if (!comment) return
      handleDeleteComment(comment, store)
    }
  })
}

export default DeleteCommentMutation
