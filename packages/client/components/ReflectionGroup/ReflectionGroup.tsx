import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {RefObject, useEffect, useMemo, useRef, useState} from 'react'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import useAtmosphere from '../../hooks/useAtmosphere'
import useEventCallback from '../../hooks/useEventCallback'
import useExpandedReflections from '../../hooks/useExpandedReflections'
import {
  DragAttribute,
  ElementWidth,
  ReflectionStackPerspective,
  Times
} from '../../types/constEnums'
import {GROUP} from '../../utils/constants'
import {ReflectionGroup_meeting} from '../../__generated__/ReflectionGroup_meeting.graphql'
import {ReflectionGroup_reflectionGroup} from '../../__generated__/ReflectionGroup_reflectionGroup.graphql'
import {SwipeColumn} from '../GroupingKanban'
import ReflectionGroupHeader from '../ReflectionGroupHeader'
import ExpandedReflectionStack from '../RetroReflectPhase/ExpandedReflectionStack'
import DraggableReflectionCard from './DraggableReflectionCard'

const CardStack = styled('div')({
  position: 'relative'
})

export const getCardStackPadding = (count: number) => {
  return Math.max(0, Math.min(3, count) - 1) * ReflectionStackPerspective.Y
}

const Group = styled('div')<{staticReflectionCount: number}>(({staticReflectionCount}) => ({
  height: 'max-content',
  position: 'relative',
  paddingTop: ElementWidth.REFLECTION_CARD_PADDING,
  paddingBottom: ElementWidth.REFLECTION_CARD_PADDING + getCardStackPadding(staticReflectionCount),
  transition: `padding-bottom ${Times.REFLECTION_DROP_DURATION}ms`
}))

const ReflectionWrapper = styled('div')<{
  staticIdx: number
  isDropping: boolean | null
  groupCount: number
}>(({staticIdx, isDropping, groupCount}): any => {
  const isHidden = staticIdx === -1 || isDropping
  const multiple = Math.min(staticIdx, 2)
  const scaleX =
    (ElementWidth.REFLECTION_CARD - ReflectionStackPerspective.X * multiple * 2) /
    ElementWidth.REFLECTION_CARD
  const translateY = ReflectionStackPerspective.Y * multiple
  return {
    position: staticIdx === 0 || (staticIdx === -1 && groupCount === 1) ? 'relative' : 'absolute',
    bottom: 0,
    left: 0,
    outline: 0,
    opacity: isHidden ? 0 : undefined,
    transform: `translateY(${translateY}px) scaleX(${scaleX})`,
    transition: isHidden ? undefined : `transform ${Times.REFLECTION_DROP_DURATION}ms`,
    zIndex: 3 - multiple
  }
})

interface Props {
  phaseRef: RefObject<HTMLDivElement>
  meeting: ReflectionGroup_meeting
  reflectionGroup: ReflectionGroup_reflectionGroup
  swipeColumn?: SwipeColumn
  dataCy?: string
}

const ReflectionGroup = (props: Props) => {
  const {meeting, phaseRef, reflectionGroup, swipeColumn, dataCy} = props
  const groupRef = useRef<HTMLDivElement>(null)
  const {localPhase, localStage} = meeting
  const {phaseType} = localPhase
  const {isComplete} = localStage
  const {reflections, id: reflectionGroupId, titleIsUserDefined} = reflectionGroup
  const titleInputRef = useRef(null)
  const expandedTitleInputRef = useRef(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const staticReflections = useMemo(() => {
    return reflections.filter(
      (reflection) =>
        !reflection.isViewerDragging && (!reflection.remoteDrag || reflection.isDropping)
    )
  }, [reflections])
  const stackRef = useRef<HTMLDivElement>(null)
  const {
    setItemsRef,
    scrollRef,
    bgRef,
    modalHeaderRef,
    portal,
    portalStatus,
    collapse,
    expand
  } = useExpandedReflections(groupRef, stackRef, reflections.length, headerRef)
  const atmosphere = useAtmosphere()
  const [isEditing, thisSetIsEditing] = useState(false)
  const isDragPhase = phaseType === 'group' && !isComplete
  const setIsEditing = (isEditing: boolean) => {
    thisSetIsEditing(isEditing)
    const [firstReflection] = staticReflections
    if (!firstReflection) return
    const {id: firstReflectionId} = firstReflection
    commitLocalUpdate(atmosphere, (store) => {
      const reflection = store.get(firstReflectionId)!
      reflection.setValue(isEditing, 'isEditing')
    })
  }

  const watchForClick = useEventCallback((e) => {
    const isClickOnGroup = e.composedPath().find((el) => el === groupRef.current)
    if (!isClickOnGroup) {
      document.removeEventListener('click', watchForClick)
      setIsEditing(false)
    }
  })
  const onClick = () => {
    if (isEditing) return
    const wasDrag = staticReflections.some((reflection) => reflection.isDropping)
    if (wasDrag) return
    if (reflections.length === 1) {
      if (!isDragPhase) return
      setIsEditing(true)
      document.addEventListener('click', watchForClick)
    } else {
      expand()
    }
  }

  useEffect(() => {
    return () => {
      document.removeEventListener('click', watchForClick)
    }
  }, [])

  const showHeader =
    phaseType !== GROUP || titleIsUserDefined || reflections.length > 1 || isEditing
  return (
    <>
      {portal(
        <ExpandedReflectionStack
          header={
            <ReflectionGroupHeader
              isExpanded
              ref={modalHeaderRef}
              meeting={meeting}
              portalStatus={portalStatus}
              reflectionGroup={reflectionGroup}
              titleInputRef={expandedTitleInputRef}
            />
          }
          phaseRef={phaseRef}
          staticReflections={staticReflections}
          reflections={reflections}
          scrollRef={scrollRef}
          bgRef={bgRef}
          setItemsRef={setItemsRef}
          closePortal={collapse}
          meeting={meeting}
          reflectionGroupId={reflectionGroupId}
        />
      )}
      <Group
        {...{[DragAttribute.DROPPABLE]: reflectionGroupId}}
        ref={groupRef}
        staticReflectionCount={staticReflections.length}
        data-cy={dataCy}
      >
        {showHeader && (
          <ReflectionGroupHeader
            dataCy={`${dataCy}-header`}
            ref={headerRef}
            meeting={meeting}
            reflectionGroup={reflectionGroup}
            portalStatus={portalStatus}
            titleInputRef={titleInputRef}
          />
        )}
        <CardStack data-cy={`${dataCy}-stack`} ref={stackRef} onClick={onClick}>
          {reflections.map((reflection) => {
            const staticIdx = staticReflections.indexOf(reflection)
            const {id: reflectionId, isDropping} = reflection
            return (
              <ReflectionWrapper
                data-cy={`${dataCy}-card-${staticIdx}`}
                key={reflectionId}
                groupCount={reflections.length}
                staticIdx={staticIdx}
                isDropping={isDropping}
              >
                <DraggableReflectionCard
                  dataCy={`${dataCy}-card-${staticIdx}`}
                  key={reflection.id}
                  staticIdx={staticIdx}
                  isClipped={staticIdx !== 0}
                  isDraggable={staticIdx === 0}
                  meeting={meeting}
                  reflection={reflection}
                  staticReflections={staticReflections}
                  swipeColumn={swipeColumn}
                />
              </ReflectionWrapper>
            )
          })}
        </CardStack>
      </Group>
    </>
  )
}

export default createFragmentContainer(ReflectionGroup, {
  meeting: graphql`
    fragment ReflectionGroup_meeting on RetrospectiveMeeting {
      ...DraggableReflectionCard_meeting
      id
      ...ReflectionGroupHeader_meeting
      localPhase {
        phaseType
      }
      localStage {
        isComplete
      }
      isViewerDragInProgress
    }
  `,
  reflectionGroup: graphql`
    fragment ReflectionGroup_reflectionGroup on RetroReflectionGroup {
      ...ReflectionGroupHeader_reflectionGroup
      promptId
      id
      sortOrder
      titleIsUserDefined
      title
      reflections {
        ...DraggableReflectionCard_reflection
        ...DraggableReflectionCard_staticReflections
        ...ReflectionCard_reflection
        id
        promptId
        sortOrder
        isViewerDragging
        isDropping
        isEditing
        remoteDrag {
          dragUserId
        }
      }
      isExpanded
    }
  `
})
