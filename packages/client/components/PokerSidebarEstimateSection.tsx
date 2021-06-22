import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd'
import {createFragmentContainer} from 'react-relay'
import useGotoStageId from '~/hooks/useGotoStageId'
import {PokerSidebarEstimateSection_meeting} from '~/__generated__/PokerSidebarEstimateSection_meeting.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMakeStageSummaries from '../hooks/useMakeStageSummaries'
import DragEstimatingTaskMutation from '../mutations/DragEstimatingTaskMutation'
import {navItemRaised} from '../styles/elevation'
import {PALETTE} from '../styles/paletteV3'
import {SORT_STEP} from '../utils/constants'
import dndNoise from '../utils/dndNoise'
import MeetingSidebarPhaseItemChild from './MeetingSidebarPhaseItemChild'
import MeetingSubnavItem from './MeetingSubnavItem'
import PokerSidebarEstimateMeta from './PokerSidebarEstimateMeta'

interface Props {
  gotoStageId: ReturnType<typeof useGotoStageId>
  handleMenuClick: () => void
  meeting: PokerSidebarEstimateSection_meeting
}

const DraggableMeetingSubnavItem = styled('div')<{isDragging: boolean}>(({isDragging}) => ({
  boxShadow: isDragging ? navItemRaised : undefined
}))

const ScrollWrapper = styled('div')({
  overflow: 'auto',
  paddingBottom: 8,
  paddingRight: 8,
  height: '100%'
})

const Title = styled('div')({
  fontSize: 14,
  lineHeight: '20px',
  wordBreak: 'break-word',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'pre'
})

const Subtitle = styled('div')({
  color: PALETTE.SLATE_500,
  fontSize: 11,
  fontWeight: 600,
  lineHeight: '12px'
})

const PokerSidebarEstimateSection = (props: Props) => {
  const {gotoStageId, handleMenuClick, meeting} = props
  const {localStage, facilitatorStageId, id: meetingId, phases, endedAt} = meeting
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const estimatePhase = phases!.find(({phaseType}) => phaseType === 'ESTIMATE')!
  const {stages} = estimatePhase!
  const {id: localStageId} = localStage
  const stageSummaries = useMakeStageSummaries(estimatePhase, localStageId)
  const inSync = localStageId === facilitatorStageId

  const onDragEnd = (result) => {
    const {source, destination} = result

    if (
      !destination ||
      destination.droppableId !== 'TASK' ||
      source.droppableId !== 'TASK' ||
      destination.index === source.index
    ) {
      return
    }

    const sourceTopic = stageSummaries![source.index]
    const destinationTopic = stageSummaries![destination.index]

    let sortOrder
    if (destination.index === 0) {
      sortOrder = destinationTopic.sortOrder - SORT_STEP + dndNoise()
    } else if (destination.index === stageSummaries!.length - 1) {
      sortOrder = destinationTopic.sortOrder + SORT_STEP + dndNoise()
    } else {
      const offset = source.index > destination.index ? -1 : 1
      sortOrder =
        (stageSummaries![destination.index + offset].sortOrder + destinationTopic.sortOrder) / 2 +
        dndNoise()
    }

    const {stageIds} = sourceTopic
    const [firstStageId] = stageIds
    const variables = {meetingId, stageId: firstStageId, sortOrder}
    DragEstimatingTaskMutation(atmosphere, variables)
  }

  const handleClick = (stageIds: string[]) => {
    // if the facilitator is at one of the stages, go there
    if (stageIds.includes(facilitatorStageId)) {
      gotoStageId(facilitatorStageId).catch()
    } else {
      // goto the first stage that the user hasn't voted on
      const summaryStages = stageIds.map((id) => stages.find((stage) => stage.id === id))
      const unvotedStage = summaryStages.find((stage) => {
        return !stage!.scores!.find(({userId}) => userId === viewerId)
      })
      if (unvotedStage) {
        gotoStageId(unvotedStage.id)
      } else {
        // goto the last stage
        const lastStageId = stageIds[stageIds.length - 1]
        gotoStageId(lastStageId)
      }
    }
    handleMenuClick()
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <MeetingSidebarPhaseItemChild>
        <Droppable droppableId={'TASK'}>
          {(provided) => {
            return (
              <ScrollWrapper ref={provided.innerRef}>
                {stageSummaries!.map((summary, idx) => {
                  const {
                    stageIds,
                    title,
                    subtitle,
                    isActive,
                    isNavigable,
                    finalScores
                  } = summary
                  const [firstStageId] = stageIds
                  // the local user is at another stage than the facilitator stage
                  const isUnsyncedFacilitatorStage =
                    !inSync && stageIds.includes(facilitatorStageId)
                  return (
                    <Draggable
                      key={firstStageId}
                      draggableId={firstStageId}
                      index={idx}
                      isDragDisabled={!!endedAt}
                    >
                      {(dragProvided, dragSnapshot) => {
                        return (
                          <DraggableMeetingSubnavItem
                            isDragging={dragSnapshot.isDragging}
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                          >
                            <MeetingSubnavItem
                              key={firstStageId}
                              isDragging={dragSnapshot.isDragging}
                              metaContent={<PokerSidebarEstimateMeta finalScores={finalScores} />}
                              onClick={() => handleClick(stageIds)}
                              isActive={isActive}
                              isDisabled={!isNavigable}
                              isUnsyncedFacilitatorStage={isUnsyncedFacilitatorStage}
                            >
                              <>
                                <Title>{title!}</Title>
                                {subtitle && <Subtitle>{subtitle}</Subtitle>}
                              </>
                            </MeetingSubnavItem>
                          </DraggableMeetingSubnavItem>
                        )
                      }}
                    </Draggable>
                  )
                })}
                {provided.placeholder}
              </ScrollWrapper>
            )
          }}
        </Droppable>
      </MeetingSidebarPhaseItemChild>
    </DragDropContext>
  )
}

export default createFragmentContainer(PokerSidebarEstimateSection, {
  meeting: graphql`
    fragment PokerSidebarEstimateSection_meeting on PokerMeeting {
      id
      endedAt
      localStage {
        id
      }
      facilitatorStageId
      # load up the localPhase
      phases {
        ...useMakeStageSummaries_phase
        ... on EstimatePhase {
          stages {
            scores {
              userId
            }
          }
        }
        phaseType
        stages {
          id
        }
      }
      localStage {
        id
      }
    }
  `
})
