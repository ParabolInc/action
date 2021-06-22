import Atmosphere from '../../Atmosphere'
import {commitLocalUpdate} from 'relay-runtime'
import EndDraggingReflectionMutation from '../../mutations/EndDraggingReflectionMutation'
import {DragReflectionDropTargetTypeEnum} from '~/__generated__/EndDraggingReflectionMutation_meeting.graphql'
import {ReflectionDragState} from '../../components/ReflectionGroup/DraggableReflectionCard'

const handleDrop = (
  atmosphere: Atmosphere,
  reflectionId: string,
  drag: ReflectionDragState,
  dropTargetType: DragReflectionDropTargetTypeEnum | null,
  dropTargetId: string | null
) => {
  commitLocalUpdate(atmosphere, (store) => {
    store.get(reflectionId)!.setValue(true, 'isDropping')
  })

  EndDraggingReflectionMutation(atmosphere, {
    reflectionId,
    dropTargetType,
    dropTargetId,
    dragId: drag.id
  })
}

export default handleDrop
