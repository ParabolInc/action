import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import useDraggableReflectionCard from '../../hooks/useDraggableReflectionCard'
import {DraggableReflectionCard_meeting} from '../../__generated__/DraggableReflectionCard_meeting.graphql'
import {DraggableReflectionCard_reflection} from '../../__generated__/DraggableReflectionCard_reflection.graphql'
import {DraggableReflectionCard_staticReflections} from '../../__generated__/DraggableReflectionCard_staticReflections.graphql'
import {SwipeColumn} from '../GroupingKanban'
import ReflectionCard from '../ReflectionCard/ReflectionCard'

export interface DropZoneBBox {
  height: number
  top: number
  bottom: number
  width: number
}

const makeDragState = () => ({
  id: '',
  cardOffsetX: 0,
  cardOffsetY: 0,
  clientY: 0, // used for scrollZone
  clone: null as null | HTMLDivElement,
  isDrag: false,
  longpressed: null as null | boolean,
  longpressTimeout: undefined as undefined | number,
  ref: null as null | HTMLDivElement,
  startX: 0,
  startY: 0,
  wasDropping: false,
  targets: [] as TargetBBox[],
  prevTargetId: '',
  isBroadcasting: false,
  dropZoneEl: null as null | HTMLDivElement,
  // dropZoneId: '',
  dropZoneBBox: null as null | DropZoneBBox,
  timeout: null as null | number
})

const DragWrapper = styled('div')<{isDraggable: boolean | undefined}>(({isDraggable}) => ({
  cursor: isDraggable ? 'grab' : undefined
}))

export type ReflectionDragState = ReturnType<typeof makeDragState>

interface Props {
  isClipped?: boolean
  isDraggable?: boolean
  meeting: DraggableReflectionCard_meeting
  reflection: DraggableReflectionCard_reflection
  staticIdx: number
  staticReflections: DraggableReflectionCard_staticReflections
  swipeColumn?: SwipeColumn
  dataCy?: string
}

export interface TargetBBox {
  targetId: string
  top: number
  bottom: number
  left: number
  height: number
}

const DraggableReflectionCard = (props: Props) => {
  const {
    isClipped,
    reflection,
    staticIdx,
    staticReflections,
    meeting,
    isDraggable,
    swipeColumn,
    dataCy
  } = props
  const {id: meetingId, teamId, localStage} = meeting
  const {isComplete, phaseType} = localStage
  const {isDropping, isEditing} = reflection
  const [drag] = useState(makeDragState)
  const staticReflectionCount = staticReflections.length
  const {onMouseDown} = useDraggableReflectionCard(
    reflection,
    drag,
    staticIdx,
    meetingId,
    teamId,
    staticReflectionCount,
    swipeColumn
  )
  const isDragPhase = phaseType === 'group' && !isComplete
  const canDrag = isDraggable && isDragPhase && !isEditing && !isDropping
  // slow state updates can mean we miss an onMouseDown event, so use isDragPhase instead of canDrag
  const handleDrag = isDragPhase ? onMouseDown : undefined
  return (
    <DragWrapper
      ref={(c) => (drag.ref = c)}
      onMouseDown={handleDrag}
      onTouchStart={handleDrag}
      isDraggable={canDrag}
    >
      <ReflectionCard
        dataCy={dataCy}
        reflection={reflection}
        isClipped={isClipped}
        meeting={meeting}
      />
    </DragWrapper>
  )
}

export default createFragmentContainer(DraggableReflectionCard, {
  staticReflections: graphql`
    fragment DraggableReflectionCard_staticReflections on RetroReflection @relay(plural: true) {
      id
      reflectionGroupId
    }
  `,
  reflection: graphql`
    fragment DraggableReflectionCard_reflection on RetroReflection {
      ...ReflectionCard_reflection
      ...RemoteReflection_reflection
      id
      isEditing
      reflectionGroupId
      promptId
      isViewerDragging
      isViewerCreator
      isDropping
      remoteDrag {
        dragUserId
        dragUserName
      }
    }
  `,
  meeting: graphql`
    fragment DraggableReflectionCard_meeting on RetrospectiveMeeting {
      ...ReflectionCard_meeting
      id
      teamId
      localStage {
        isComplete
        phaseType
      }
      phases {
        stages {
          isComplete
          phaseType
        }
      }
    }
  `
})
