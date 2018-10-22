/**
 * Renders the UI for the reflection phase of the retrospective meeting
 *
 */
import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import MeetingPhaseWrapper from 'universal/components/MeetingPhaseWrapper'
import StyledError from 'universal/components/StyledError'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import MeetingControlBar from 'universal/modules/meeting/components/MeetingControlBar/MeetingControlBar'
import AutoGroupReflectionsMutation from 'universal/mutations/AutoGroupReflectionsMutation'
import {VOTE} from 'universal/utils/constants'
import {phaseLabelLookup} from 'universal/utils/meetings/lookups'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'
import FlatButton from 'universal/components/FlatButton'
import IconLabel from 'universal/components/IconLabel'
import GroupHelpMenu from 'universal/components/MeetingHelp/GroupHelpMenu'
import {RetroGroupPhase_team} from '__generated__/RetroGroupPhase_team.graphql'
import handleRightArrow from '../utils/handleRightArrow'
import PhaseItemMasonry from './PhaseItemMasonry'

interface Props extends WithMutationProps, WithAtmosphereProps {
  gotoNext: () => void
  gotoNextRef: React.RefObject<HTMLDivElement>
  team: RetroGroupPhase_team
}

const RetroGroupPhase = (props: Props) => {
  const {
    atmosphere,
    error,
    gotoNext,
    gotoNextRef,
    onError,
    onCompleted,
    submitting,
    submitMutation,
    team
  } = props
  const {viewerId} = atmosphere
  const {newMeeting} = team
  if (!newMeeting) return null
  const {nextAutoGroupThreshold, facilitatorUserId, meetingId} = newMeeting
  const isFacilitating = facilitatorUserId === viewerId
  const nextPhaseLabel = phaseLabelLookup[VOTE]
  const autoGroup = () => {
    if (submitting) return
    submitMutation()
    const groupingThreshold = nextAutoGroupThreshold || 0.5
    AutoGroupReflectionsMutation(atmosphere, {meetingId, groupingThreshold}, onError, onCompleted)
  }
  const canAutoGroup = !nextAutoGroupThreshold || nextAutoGroupThreshold < 1
  return (
    <React.Fragment>
      {error && <StyledError>{error}</StyledError>}
      <MeetingPhaseWrapper>
        <PhaseItemMasonry meeting={newMeeting} />
      </MeetingPhaseWrapper>
      {isFacilitating && (
        <MeetingControlBar>
          <FlatButton
            size='medium'
            onClick={gotoNext}
            onKeyDown={handleRightArrow(gotoNext)}
            innerRef={gotoNextRef}
          >
            <IconLabel
              icon='arrow_forward'
              iconAfter
              iconColor='warm'
              iconLarge
              label={`Done! Let’s ${nextPhaseLabel}`}
            />
          </FlatButton>
          {canAutoGroup && (
            <FlatButton size='medium' onClick={autoGroup} waiting={submitting}>
              <IconLabel icon='photo_filter' iconColor='midGray' iconLarge label={'Auto Group'} />
            </FlatButton>
          )}
        </MeetingControlBar>
      )}
      <GroupHelpMenu floatAboveBottomBar={isFacilitating} isFacilitating={isFacilitating} />
    </React.Fragment>
  )
}

export default createFragmentContainer(
  withMutationProps(withAtmosphere(RetroGroupPhase)),
  graphql`
    fragment RetroGroupPhase_team on Team {
      newMeeting {
        meetingId: id
        facilitatorUserId
        ...PhaseItemColumn_meeting
        ... on RetrospectiveMeeting {
          ...PhaseItemMasonry_meeting
          nextAutoGroupThreshold
          reflectionGroups {
            id
            meetingId
            sortOrder
            retroPhaseItemId
            reflections {
              id
              retroPhaseItemId
              sortOrder
            }
          }
        }
      }
    }
  `
)
