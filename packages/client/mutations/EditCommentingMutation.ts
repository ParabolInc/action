import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {EditCommentingMutation as TEditCommentingMutation} from '../__generated__/EditCommentingMutation.graphql'
import {StandardMutation, SharedUpdater} from '../types/relayMutations'
import {EditCommentingMutation_meeting} from '~/__generated__/EditCommentingMutation_meeting.graphql'
import handleEditCommenting from './handlers/handleEditCommenting'

graphql`
  fragment EditCommentingMutation_meeting on EditCommentingPayload {
    commentor {
      id
      preferredName
    }
    isCommenting
    meetingId
    threadId
  }
`

const mutation = graphql`
  mutation EditCommentingMutation($isCommenting: Boolean!, $meetingId: ID!, $threadId: ID!) {
    editCommenting(isCommenting: $isCommenting, meetingId: $meetingId, threadId: $threadId) {
      ...EditCommentingMutation_meeting @relay(mask: false)
    }
  }
`

export const editCommentingMeetingUpdater: SharedUpdater<EditCommentingMutation_meeting> = (
  payload,
  {store}
) => {
  handleEditCommenting(payload, store)
}

const EditCommentingMutation: StandardMutation<TEditCommentingMutation> = (
  atmosphere,
  variables
) => {
  return commitMutation<TEditCommentingMutation>(atmosphere, {
    mutation,
    variables
  })
}

export default EditCommentingMutation
