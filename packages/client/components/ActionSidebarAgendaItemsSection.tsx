import graphql from 'babel-plugin-relay/macro'
import React, {useMemo} from 'react'
import {createFragmentContainer} from 'react-relay'

import {ActionSidebarAgendaItemsSection_meeting} from '../__generated__/ActionSidebarAgendaItemsSection_meeting.graphql'
import useGotoStageId from '../hooks/useGotoStageId'
import AgendaListAndInput from '../modules/teamDashboard/components/AgendaListAndInput/AgendaListAndInput'
import MeetingSidebarPhaseItemChild from './MeetingSidebarPhaseItemChild'
import {NavSidebar} from '../types/constEnums'

interface Props {
  gotoStageId: ReturnType<typeof useGotoStageId>
  handleMenuClick: () => void
  meeting: ActionSidebarAgendaItemsSection_meeting
  maxAgendaItemsHeight: number
}

const ActionSidebarAgendaItemsSection = (props: Props) => {
  const {gotoStageId, handleMenuClick, meeting, maxAgendaItemsHeight} = props
  const {phases, team} = meeting
  const handleClick = async (stageId: string) => {
    gotoStageId(stageId).catch()
    handleMenuClick()
  }
  // show agenda (no blur) at all times if the updates phase isNavigable
  // facilitator can click on updates nav item before completing all check-in stages
  const updatesPhase = phases.find((phase) => phase.phaseType === 'updates')
  const isUpdatesNavigable = updatesPhase && updatesPhase.stages![0].isNavigable
  const agendaItemsCount = useMemo(() => {
    const agendaItemsPhase = phases.find((phase) => phase.phaseType === 'agendaitems')

    return (
      agendaItemsPhase?.stages
        ?.map((stage) => stage.agendaItem)
        .filter((agendaItem) => agendaItem?.content).length || 0
    )
  }, [phases])
  const maxHeight =
    agendaItemsCount * NavSidebar.ITEM_HEIGHT +
    NavSidebar.AGENDA_ITEM_INPUT_HEIGHT +
    (agendaItemsCount === 0 ? NavSidebar.EMPTY_BLOCK_HEIGHT : 0)
  const childHeight = Math.min(maxAgendaItemsHeight, maxHeight)

  return (
    <MeetingSidebarPhaseItemChild height={childHeight}>
      <AgendaListAndInput
        gotoStageId={handleClick}
        isDisabled={!isUpdatesNavigable}
        meeting={meeting}
        team={team!}
      />
    </MeetingSidebarPhaseItemChild>
  )
}

graphql`
  fragment ActionSidebarAgendaItemsSectionAgendaItemPhase on NewMeetingPhase {
    ... on UpdatesPhase {
      stages {
        isNavigable
      }
    }
  }
`

export default createFragmentContainer(ActionSidebarAgendaItemsSection, {
  meeting: graphql`
    fragment ActionSidebarAgendaItemsSection_meeting on ActionMeeting {
      ...AgendaListAndInput_meeting
      phases {
        phaseType
        ...ActionSidebarAgendaItemsSectionAgendaItemPhase @relay(mask: false)
        ... on AgendaItemsPhase {
          stages {
            agendaItem {
              id
              content
            }
          }
        }
      }
      team {
        ...AgendaListAndInput_team
      }
    }
  `
})
