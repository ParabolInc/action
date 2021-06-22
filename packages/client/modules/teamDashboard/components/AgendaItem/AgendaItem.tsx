import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useEffect, useRef, useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import {AgendaItem_meeting} from '~/__generated__/AgendaItem_meeting.graphql'
import Avatar from '../../../../components/Avatar/Avatar'
import IconButton from '../../../../components/IconButton'
import MeetingSubnavItem from '../../../../components/MeetingSubnavItem'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {MenuPosition} from '../../../../hooks/useCoords'
import useGotoStageId from '../../../../hooks/useGotoStageId'
import useScrollIntoView from '../../../../hooks/useScrollIntoVIew'
import useTooltip from '../../../../hooks/useTooltip'
import RemoveAgendaItemMutation from '../../../../mutations/RemoveAgendaItemMutation'
import UpdateAgendaItemMutation from '../../../../mutations/UpdateAgendaItemMutation'
import pinIcon from '../../../../styles/theme/images/icons/pin.svg'
import unpinIcon from '../../../../styles/theme/images/icons/unpin.svg'
import {ICON_SIZE} from '../../../../styles/typographyV2'
import findStageAfterId from '../../../../utils/meetings/findStageAfterId'
import {AgendaItem_agendaItem} from '../../../../__generated__/AgendaItem_agendaItem.graphql'

const AgendaItemStyles = styled('div')({
  position: 'relative',
  // show the DeleteIconButton on hover
  '&:hover > button': {
    opacity: 1
  }
})

const DeleteIconButton = styled(IconButton)<{disabled?: boolean}>(({disabled}) => ({
  display: 'block',
  // we can make the position of the del (x) more centered when there’s a low number of agenda items
  left: 19,
  lineHeight: ICON_SIZE.MD18,
  opacity: 0,
  position: 'absolute',
  top: '.6875rem',
  transition: 'opacity .1s ease-in',
  visibility: disabled ? 'hidden' : undefined
}))

const IconBlock = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  marginRight: '4px',
  width: '2rem',
  '&:active': {
    opacity: 0.7
  },
  '&:hover': {
    cursor: 'pointer'
  }
})

const SvgIcon = styled('img')({
  opacity: 0.7
})

const getItemProps = (
  agendaItemId: string,
  viewerId: string,
  gotoStageId: ReturnType<typeof useGotoStageId> | undefined,
  meeting: AgendaItem_meeting | null
) => {
  const fallback = {
    isDisabled: false,
    isFacilitatorStage: false,
    onClick: undefined,
    isActive: false,
    isComplete: false,
    isUnsyncedFacilitatorStage: false
  }
  if (!meeting) return fallback
  const {facilitatorUserId, facilitatorStageId, localStage, localPhase, phases} = meeting
  const agendaItemsPhase = phases.find((phase) => phase.phaseType === 'agendaitems')!
  const localStageId = (localStage && localStage.id) || ''
  const {phaseType} = localPhase
  const {stages} = phaseType === 'agendaitems' ? localPhase : agendaItemsPhase
  if (!stages) return fallback
  const agendaItemStage = stages.find((stage) => stage.agendaItem?.id === agendaItemId)
  if (!agendaItemStage) return fallback
  const {isComplete, isNavigable, isNavigableByFacilitator, id: stageId} = agendaItemStage
  const isLocalStage = localStageId === stageId
  const isFacilitatorStage = facilitatorStageId === stageId
  const isUnsyncedFacilitatorStage = isFacilitatorStage !== isLocalStage && !isLocalStage
  const isViewerFacilitator = viewerId === facilitatorUserId
  const isDisabled = isViewerFacilitator ? !isNavigableByFacilitator : !isNavigable
  const onClick = () => {
    gotoStageId!(stageId)
  }

  return {
    isUnsyncedFacilitatorStage,
    isComplete: !!isComplete,
    isDisabled,
    isFacilitatorStage,
    onClick,
    isActive: isLocalStage
  }
}

interface Props {
  agendaItem: AgendaItem_agendaItem
  gotoStageId: ReturnType<typeof useGotoStageId> | undefined
  isDragging: boolean
  meeting: AgendaItem_meeting | null
}

const AgendaItem = (props: Props) => {
  const {agendaItem, gotoStageId, isDragging, meeting} = props
  const {id: agendaItemId, content, pinned, teamMember} = agendaItem
  const meetingId = meeting?.id
  const endedAt = meeting?.endedAt
  const facilitatorUserId = meeting?.facilitatorUserId
  const facilitatorStageId = meeting?.facilitatorStageId
  const phases = meeting?.phases ?? null
  const {picture} = teamMember
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const ref = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)
  const {tooltipPortal, openTooltip, closeTooltip, originRef} = useTooltip<HTMLDivElement>(
    MenuPosition.UPPER_CENTER
  )
  const {
    isDisabled,
    onClick,
    isActive,
    isComplete,
    isUnsyncedFacilitatorStage,
    isFacilitatorStage
  } = getItemProps(agendaItemId, viewerId, gotoStageId, meeting)

  useScrollIntoView(ref, isFacilitatorStage)
  useEffect(() => {
    ref.current && ref.current.scrollIntoView({behavior: 'smooth'})
  }, [])

  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    UpdateAgendaItemMutation(
      atmosphere,
      {updatedAgendaItem: {id: agendaItemId, pinned: !pinned}},
      {meetingId}
    )
  }

  const handleRemove = () => {
    if (viewerId === facilitatorUserId && isFacilitatorStage) {
      // navigate to the next best stage. onward!
      const stageRes = findStageAfterId(phases as any, facilitatorStageId!)
      if (gotoStageId && stageRes) {
        gotoStageId(stageRes.stage.id)
      }
    }
    RemoveAgendaItemMutation(atmosphere, {agendaItemId}, {meetingId})
  }

  const getIcon = () => {
    if (pinned && isHovering) return <SvgIcon alt='unpinIcon' src={unpinIcon} />
    else if (!pinned && !isHovering) return <Avatar hasBadge={false} picture={picture} size={24} />
    else return <SvgIcon alt='pinnedIcon' src={pinIcon} />
  }

  return (
    <>
      <AgendaItemStyles
        onMouseOver={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <MeetingSubnavItem
          metaContent={
            <IconBlock
              onClick={handleIconClick}
              onMouseEnter={openTooltip}
              onMouseLeave={closeTooltip}
              ref={originRef}
            >
              {getIcon()}
            </IconBlock>
          }
          isDisabled={isDisabled}
          onClick={onClick}
          isActive={isActive}
          isComplete={isComplete}
          isDragging={isDragging}
          isUnsyncedFacilitatorStage={isUnsyncedFacilitatorStage}
        >
          {content}
        </MeetingSubnavItem>
        <DeleteIconButton
          aria-label={'Remove this agenda topic'}
          disabled={!!endedAt}
          icon='cancel'
          onClick={handleRemove}
          palette='midGray'
        />
      </AgendaItemStyles>
      {tooltipPortal(
        pinned ? `Unpin "${content}" from every check-in` : `Pin "${content}" to every check-in`
      )}
    </>
  )
}

graphql`
  fragment AgendaItemPhase on AgendaItemsPhase {
    stages {
      id
      agendaItem {
        id
      }
      isComplete
      isNavigable
      isNavigableByFacilitator
    }
  }
`

export default createFragmentContainer(AgendaItem, {
  agendaItem: graphql`
    fragment AgendaItem_agendaItem on AgendaItem {
      id
      content
      pinned
      teamMember {
        picture
      }
    }
  `,
  meeting: graphql`
    fragment AgendaItem_meeting on ActionMeeting {
      id
      endedAt
      facilitatorStageId
      facilitatorUserId
      phases {
        phaseType
        stages {
          id
        }
        ...AgendaItemPhase @relay(mask: false)
      }
      localPhase {
        phaseType
        ...AgendaItemPhase @relay(mask: false)
      }
      localStage {
        id
      }
    }
  `
})
