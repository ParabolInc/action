import type {CompletedHandler, ErrorHandler} from 'universal/types/relay'
import {commitMutation} from 'react-relay'
import getInProxy from 'universal/utils/relay/getInProxy'
import createProxyRecord from 'universal/utils/relay/createProxyRecord'

type Variables = {
  isDragging: boolean,
  reflectionId: string
}

graphql`
  fragment DragReflectionMutation_team on DragReflectionPayload {
    reflection {
      id
      dragContext {
        draggerUserId
        draggerUser {
          id
          preferredName
        }
      }
    }
  }
`

const mutation = graphql`
  mutation DragReflectionMutation($isDragging: Boolean!, $reflectionId: ID!) {
    dragReflection(isDragging: $isDragging, reflectionId: $reflectionId) {
      ...DragReflectionMutation_team @relay(mask: false)
    }
  }
`

export const dragReflectionTeamUpdater = (payload, store) => {
  const startDragging = Boolean(getInProxy(payload, 'reflection', 'dragContext', 'draggerUserId'))
  if (!startDragging) {
    const reflectionId = getInProxy(payload, 'reflection', 'id')
    if (!reflectionId) return
    const reflection = store.get(reflectionId)
    reflection.setValue(null, 'dragContext')
  }
}

const DragReflectionMutation = (
  atmosphere: Object,
  variables: Variables,
  onError?: ErrorHandler,
  onCompleted?: CompletedHandler
) => {
  commitMutation(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    updater: (store) => {
      const payload = store.getRootField('dragReflection')
      if (!payload) return
      dragReflectionTeamUpdater(payload, store)
    },
    optimisticUpdater: (store) => {
      const {viewerId} = atmosphere
      const {isDragging, reflectionId} = variables
      const reflection = store.get(reflectionId)
      // console.log('opt ctx - ', reflection.getLinkedRecord('dragContext'))
      if (isDragging) {
        const dragContext = createProxyRecord(store, 'DragContext', {
          draggerUserId: viewerId
        })
        dragContext.setLinkedRecord(store.get(viewerId), 'draggerUser')
        reflection.setLinkedRecord(dragContext, 'dragContext')
      } else {
        reflection.setValue(null, 'dragContext')
      }
    }
  })
}

export default DragReflectionMutation
