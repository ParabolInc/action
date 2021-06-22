import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import handleEditReflection from './handlers/handleEditReflection'
import {SharedUpdater, SimpleMutation} from '../types/relayMutations'
import {EditReflectionMutation as TEditReflectionMutation} from '../__generated__/EditReflectionMutation.graphql'
import {EditReflectionMutation_meeting} from '~/__generated__/EditReflectionMutation_meeting.graphql'

graphql`
  fragment EditReflectionMutation_meeting on EditReflectionPayload {
    editorId
    isEditing
    promptId
  }
`

const mutation = graphql`
  mutation EditReflectionMutation($promptId: ID!, $isEditing: Boolean!, $meetingId: ID!) {
    editReflection(promptId: $promptId, isEditing: $isEditing, meetingId: $meetingId) {
      ...EditReflectionMutation_meeting @relay(mask: false)
    }
  }
`

export const editReflectionMeetingUpdater: SharedUpdater<EditReflectionMutation_meeting> = (
  payload,
  {store}
) => {
  handleEditReflection(payload, store)
}

const EditReflectionMutation: SimpleMutation<TEditReflectionMutation> = (atmosphere, variables) => {
  return commitMutation(atmosphere, {
    mutation,
    variables
    // updater: (store) => {
    //   const payload = store.getRootField('editReflection')
    //   if (!payload) return
    //   editReflectionTeamUpdater(payload, store)
    // },
    // optimisticUpdater: (store) => {
    //   const {phaseItemId, isEditing} = variables
    //   const phaseItem = store.get(phaseItemId)
    //   if (!phaseItem) return
    //   const editorIds = phaseItem.getValue('editorIds') || []
    //   const nextEditorIds = isEditing
    //     ? Array.from(new Set(editorIds.concat('tmpUser')))
    //     : editorIds.filter((id) => id !== 'tmpUser')
    //   phaseItem.setValue(nextEditorIds, 'editorIds')
    // }
  })
}

export default EditReflectionMutation
