import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {RefObject, useMemo, useRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import {useCoverable} from '~/hooks/useControlBarCovers'
import useDeepEqual from '~/hooks/useDeepEqual'
import useSubColumns from '~/hooks/useSubColumns'
import makeMinWidthMediaQuery from '~/utils/makeMinWidthMediaQuery'
import {GroupingKanbanColumn_meeting} from '~/__generated__/GroupingKanbanColumn_meeting.graphql'
import {GroupingKanbanColumn_prompt} from '~/__generated__/GroupingKanbanColumn_prompt.graphql'
import {GroupingKanbanColumn_reflectionGroups} from '~/__generated__/GroupingKanbanColumn_reflectionGroups.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import CreateReflectionMutation from '../mutations/CreateReflectionMutation'
import {PALETTE} from '../styles/paletteV3'
import {
  BezierCurve,
  Breakpoint,
  DragAttribute,
  ElementWidth,
  MeetingControlBarEnum
} from '../types/constEnums'
import getNextSortOrder from '../utils/getNextSortOrder'
import {SwipeColumn} from './GroupingKanban'
import GroupingKanbanColumnHeader from './GroupingKanbanColumnHeader'
import ReflectionGroup from './ReflectionGroup/ReflectionGroup'

const Column = styled('div')<{
  isLengthExpanded: boolean
  isFirstColumn: boolean
  isLastColumn: boolean
}>(({isLengthExpanded, isFirstColumn, isLastColumn}) => ({
  alignContent: 'flex-start',
  background: PALETTE.SLATE_300,
  borderRadius: 8,
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  height: '100%',
  minWidth: ElementWidth.REFLECTION_COLUMN,
  padding: 0,
  position: 'relative',
  transition: `all 100ms ${BezierCurve.DECELERATE}`,
  [makeMinWidthMediaQuery(Breakpoint.SINGLE_REFLECTION_COLUMN)]: {
    height: isLengthExpanded ? '100%' : `calc(100% - ${MeetingControlBarEnum.HEIGHT}px)`,
    margin: `0 ${isLastColumn ? 16 : 8}px 0px ${isFirstColumn ? 16 : 8}px`,
    maxWidth: 'min-content'
  }
}))

const ColumnScrollContainer = styled('div')({
  display: 'flex',
  // must hide X on firefox v84
  overflowX: 'hidden',
  overflowY: 'auto',
  height: '100%'
})

const ColumnBody = styled('div')<{isDesktop: boolean; isWidthExpanded: boolean}>(
  ({isDesktop, isWidthExpanded}) => ({
    alignContent: 'flex-start',
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    maxHeight: 'fit-content',
    minHeight: 200,
    padding: `${isWidthExpanded ? 12 : 6}px ${isDesktop ? 12 : 8}px`,
    transition: `all 100ms ${BezierCurve.DECELERATE}`,
    minWidth: ElementWidth.REFLECTION_COLUMN
  })
)

interface Props {
  columnsRef: RefObject<HTMLDivElement>
  isAnyEditing: boolean
  isDesktop: boolean
  meeting: GroupingKanbanColumn_meeting
  phaseRef: RefObject<HTMLDivElement>
  prompt: GroupingKanbanColumn_prompt
  reflectionGroups: GroupingKanbanColumn_reflectionGroups
  reflectPromptsCount: number
  swipeColumn?: SwipeColumn
}

const GroupingKanbanColumn = (props: Props) => {
  const {
    columnsRef,
    isAnyEditing,
    isDesktop,
    meeting,
    reflectionGroups,
    phaseRef,
    prompt,
    reflectPromptsCount,
    swipeColumn
  } = props
  const {question, id: promptId, groupColor} = prompt
  const {id: meetingId, endedAt, localStage} = meeting
  const {isComplete, phaseType} = localStage
  const {submitting, onError, submitMutation, onCompleted} = useMutationProps()
  const atmosphere = useAtmosphere()
  const columnRef = useRef<HTMLDivElement>(null)
  const columnBodyRef = useRef<HTMLDivElement>(null)
  const isLengthExpanded =
    useCoverable(promptId, columnRef, MeetingControlBarEnum.HEIGHT, phaseRef, columnsRef) ||
    !!endedAt
  const isFirstColumn = prompt.sortOrder === 0
  const isLastColumn = Math.round(prompt.sortOrder) === reflectPromptsCount - 1
  const groups = useDeepEqual(reflectionGroups)
  // group may be undefined because relay could GC before useMemo in the Kanban recomputes >:-(
  const filteredReflectionGroups = useMemo(
    () => groups.filter((group) => group.reflections.length > 0),
    [groups]
  )
  const [isWidthExpanded, subColumnIndexes, toggleWidth] = useSubColumns(
    columnBodyRef,
    phaseRef,
    reflectPromptsCount,
    filteredReflectionGroups,
    columnsRef
  )
  const canAdd = phaseType === 'group' && !isComplete && !isAnyEditing

  const onClick = () => {
    if (submitting || isAnyEditing) return
    const input = {
      content: undefined,
      meetingId,
      promptId,
      sortOrder: getNextSortOrder(filteredReflectionGroups)
    }
    submitMutation()
    CreateReflectionMutation(atmosphere, {input}, {onError, onCompleted})
  }

  return (
    <Column
      isLengthExpanded={isLengthExpanded}
      isFirstColumn={isFirstColumn}
      isLastColumn={isLastColumn}
      ref={columnRef}
      data-cy={`group-column-${question}`}
    >
      <GroupingKanbanColumnHeader
        canAdd={canAdd}
        groupColor={groupColor}
        isWidthExpanded={isWidthExpanded}
        onClick={onClick}
        question={question}
        phaseType={phaseType}
        submitting={submitting}
        toggleWidth={toggleWidth}
      />
      <ColumnScrollContainer>
        {subColumnIndexes.map((subColumnIdx) => {
          return (
            <ColumnBody
              data-cy={subColumnIdx === 0 ? `group-column-${question}-body` : undefined}
              isDesktop={isDesktop}
              isWidthExpanded={isWidthExpanded}
              key={`${promptId}-${subColumnIdx}`}
              ref={subColumnIdx === 0 ? columnBodyRef : undefined}
              {...{[DragAttribute.DROPZONE]: `${promptId}-${subColumnIdx}`}}
            >
              {filteredReflectionGroups
                .filter((group) => (isWidthExpanded ? group.subColumnIdx === subColumnIdx : true))
                .map((reflectionGroup, idx) => {
                  return (
                    <ReflectionGroup
                      dataCy={`${question}-group-${idx}`}
                      key={reflectionGroup.id}
                      meeting={meeting}
                      phaseRef={phaseRef}
                      reflectionGroup={reflectionGroup}
                      swipeColumn={swipeColumn}
                    />
                  )
                })}
            </ColumnBody>
          )
        })}
      </ColumnScrollContainer>
    </Column>
  )
}

export default createFragmentContainer(GroupingKanbanColumn, {
  meeting: graphql`
    fragment GroupingKanbanColumn_meeting on RetrospectiveMeeting {
      ...ReflectionGroup_meeting
      id
      endedAt
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
  `,
  reflectionGroups: graphql`
    fragment GroupingKanbanColumn_reflectionGroups on RetroReflectionGroup @relay(plural: true) {
      ...ReflectionGroup_reflectionGroup
      id
      reflections {
        id
      }
      sortOrder
      subColumnIdx
    }
  `,
  prompt: graphql`
    fragment GroupingKanbanColumn_prompt on ReflectPrompt {
      id
      question
      groupColor
      sortOrder
    }
  `
})
