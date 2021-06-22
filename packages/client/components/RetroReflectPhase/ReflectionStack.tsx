import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {RefObject, useRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import {ReflectionStack_meeting} from '~/__generated__/ReflectionStack_meeting.graphql'
import useExpandedReflections from '../../hooks/useExpandedReflections'
import {
  Breakpoint,
  ElementHeight,
  ElementWidth,
  ReflectionStackPerspective
} from '../../types/constEnums'
import {PhaseItemColumn_meeting} from '../../__generated__/PhaseItemColumn_meeting.graphql'
import ReflectionCard from '../ReflectionCard/ReflectionCard'
import ExpandedReflectionStack from './ExpandedReflectionStack'
import ReflectionStackPlaceholder from './ReflectionStackPlaceholder'

interface Props {
  idx: number
  meeting: ReflectionStack_meeting
  phaseEditorRef: React.RefObject<HTMLDivElement>
  phaseRef: RefObject<HTMLDivElement>
  dataCy: string
  reflectionStack: readonly PhaseItemColumn_meeting['reflectionGroups'][0]['reflections'][0][]
  stackTopRef: RefObject<HTMLDivElement>
}

const CardStack = styled('div')({
  alignItems: 'flex-start',
  display: 'flex',
  flex: 1,
  margin: '0 0 24px', // stacked cards + row gutter = 6 + 6 + 12 = 24
  position: 'relative',
  justifyContent: 'center',
  [`@media screen and (min-width: ${Breakpoint.SINGLE_REFLECTION_COLUMN}px)`]: {
    minHeight: ElementHeight.REFLECTION_CARD_MAX
  }
})

const CenteredCardStack = styled('div')({
  position: 'relative'
})

const ReflectionWrapper = styled('div')<{idx: number}>(({idx}): any => {
  const multiple = Math.min(idx, 2)
  const scaleX =
    (ElementWidth.REFLECTION_CARD - ReflectionStackPerspective.X * multiple * 2) /
    ElementWidth.REFLECTION_CARD
  const translateY = ReflectionStackPerspective.Y * multiple
  return {
    cursor: 'pointer',
    position: idx === 0 ? 'relative' : 'absolute',
    bottom: 0,
    left: 0,
    outline: 0,
    transform: `translateY(${translateY}px) scaleX(${scaleX})`,
    zIndex: 3 - multiple
  }
})

const ReflectionStack = (props: Props) => {
  const {phaseRef, idx, meeting, reflectionStack, stackTopRef, dataCy} = props
  const stackRef = useRef<HTMLDivElement>(null)
  const {setItemsRef, scrollRef, bgRef, portal, collapse, expand} = useExpandedReflections(
    stackRef,
    stackRef,
    reflectionStack.length
  )
  if (reflectionStack.length === 0) {
    return <ReflectionStackPlaceholder idx={idx} ref={stackTopRef} />
  }
  return (
    <React.Fragment>
      {portal(
        <ExpandedReflectionStack
          phaseRef={phaseRef}
          staticReflections={reflectionStack}
          reflections={reflectionStack}
          meeting={meeting}
          scrollRef={scrollRef}
          bgRef={bgRef}
          setItemsRef={setItemsRef}
          closePortal={collapse}
        />
      )}
      <div>
        <CardStack data-cy={dataCy} onClick={expand} ref={stackRef}>
          <CenteredCardStack>
            {reflectionStack.map((reflection, idx) => {
              return (
                <ReflectionWrapper
                  key={reflection.id}
                  idx={idx}
                  ref={idx === 0 ? stackTopRef : undefined}
                  data-cy={`${dataCy}-card-wrapper-${idx}`}
                >
                  <ReflectionCard
                    dataCy={`${dataCy}-card-${idx}`}
                    meeting={meeting}
                    reflection={reflection}
                    stackCount={reflectionStack.length}
                    isClipped={idx !== 0}
                  />
                </ReflectionWrapper>
              )
            })}
          </CenteredCardStack>
        </CardStack>
      </div>
    </React.Fragment>
  )
}

export default createFragmentContainer(ReflectionStack, {
  meeting: graphql`
    fragment ReflectionStack_meeting on RetrospectiveMeeting {
      ...DraggableReflectionCard_meeting
      ...ReflectionCard_meeting
      id
    }
  `
})
