import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import AgendaShortcutHint from '../modules/meeting/components/AgendaShortcutHint/AgendaShortcutHint'
import MeetingCopy from '../modules/meeting/components/MeetingCopy/MeetingCopy'
import MeetingFacilitationHint from '../modules/meeting/components/MeetingFacilitationHint/MeetingFacilitationHint'
import MeetingPhaseHeading from '../modules/meeting/components/MeetingPhaseHeading/MeetingPhaseHeading'
import {AGENDA_ITEMS, AGENDA_ITEM_LABEL} from '../utils/constants'
import {phaseLabelLookup} from '../utils/meetings/lookups'
import {ActionMeetingFirstCall_meeting} from '../__generated__/ActionMeetingFirstCall_meeting.graphql'
import {ActionMeetingPhaseProps} from './ActionMeeting'
import MeetingContent from './MeetingContent'
import MeetingHeaderAndPhase from './MeetingHeaderAndPhase'
import MeetingTopBar from './MeetingTopBar'
import PhaseHeaderTitle from './PhaseHeaderTitle'
import PhaseWrapper from './PhaseWrapper'

interface Props extends ActionMeetingPhaseProps {
  meeting: ActionMeetingFirstCall_meeting
}

const FirstCallWrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%'
})

const ActionMeetingFirstCall = (props: Props) => {
  const {avatarGroup, toggleSidebar, meeting} = props
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const {endedAt, facilitator, facilitatorUserId, phases, showSidebar} = meeting
  const {preferredName} = facilitator
  const isFacilitating = facilitatorUserId === viewerId && !endedAt
  const phaseName = phaseLabelLookup[AGENDA_ITEMS]
  const agendaItemPhase = phases.find((phase) => phase.phaseType === 'agendaitems')!
  const {stages} = agendaItemPhase
  const agendaItemsCompleted = stages.filter((stage) => stage.isComplete).length
  return (
    <MeetingContent>
      <MeetingHeaderAndPhase hideBottomBar={!!endedAt}>
        <MeetingTopBar
          avatarGroup={avatarGroup}
          isMeetingSidebarCollapsed={!showSidebar}
          toggleSidebar={toggleSidebar}
        >
          <PhaseHeaderTitle>{phaseLabelLookup.agendaitems}</PhaseHeaderTitle>
        </MeetingTopBar>
        <PhaseWrapper>
          <FirstCallWrapper>
            <MeetingPhaseHeading>
              {endedAt && agendaItemsCompleted === 0
                ? 'Nothing to see here'
                : 'Now, what do you need?'}
            </MeetingPhaseHeading>
            <MeetingCopy>
              {endedAt && agendaItemsCompleted === 0
                ? `There were no ${AGENDA_ITEM_LABEL}s in this meeting.`
                : `Time to add your ${AGENDA_ITEM_LABEL}s to the list.`}
            </MeetingCopy>
            {!endedAt && (
              <>
                <AgendaShortcutHint />
                {!isFacilitating && (
                  <MeetingFacilitationHint>
                    {'Waiting for'} <b>{preferredName}</b> {`to start the ${phaseName}`}
                  </MeetingFacilitationHint>
                )}
              </>
            )}
          </FirstCallWrapper>
        </PhaseWrapper>
      </MeetingHeaderAndPhase>
    </MeetingContent>
  )
}

export default createFragmentContainer(ActionMeetingFirstCall, {
  meeting: graphql`
    fragment ActionMeetingFirstCall_meeting on ActionMeeting {
      showSidebar
      endedAt
      facilitatorUserId
      facilitator {
        preferredName
      }
      phases {
        phaseType
        stages {
          isComplete
        }
      }
    }
  `
})
