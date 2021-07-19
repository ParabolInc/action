import styled from '@emotion/styled'
import React, {ReactNode} from 'react'
import {PALETTE} from '../styles/paletteV3'
import {NavSidebar} from '../types/constEnums'
import {phaseIconLookup, phaseImageLookup, phaseLabelLookup} from '../utils/meetings/lookups'
import Badge from './Badge/Badge'
import Icon from './Icon'
import {NewMeetingPhaseTypeEnum} from '../__generated__/ActionMeeting_meeting.graphql'

const minHeightPhases: NewMeetingPhaseTypeEnum[] = ['agendaitems', 'discuss', 'ESTIMATE']
const NavListItem = styled('li')<{phaseType: NewMeetingPhaseTypeEnum}>(({phaseType}) => ({
  fontWeight: 600,
  display: 'flex',
  flexDirection: 'column',
  margin: 0,
  // hack to work around broken flexbox
  // https://bugs.chromium.org/p/chromium/issues/detail?id=927066
  // minHeightPhases require a minHeight number for scroll
  // others use fit-content so they don't get squeezed
  minHeight: minHeightPhases.includes(phaseType)
    ? phaseType === 'agendaitems'
      ? NavSidebar.ITEM_HEIGHT + NavSidebar.AGENDA_ITEM_INPUT_HEIGHT
      : NavSidebar.ITEM_HEIGHT
    : 'fit-content'
}))

const NavItemIcon = styled(Icon)<{isUnsyncedFacilitatorPhase: boolean}>(
  {
    color: PALETTE.SLATE_600,
    margin: '0 16px'
  },
  ({isUnsyncedFacilitatorPhase}) => ({
    color: isUnsyncedFacilitatorPhase ? PALETTE.ROSE_500 : undefined
  })
)

const NavItemSVG = styled('div')<{isUnsyncedFacilitatorPhase: boolean}>(
  ({isUnsyncedFacilitatorPhase}) => ({
    height: 24,
    margin: '0 16px',
    width: 24,
    '& svg': {
      '& path': {
        fill: isUnsyncedFacilitatorPhase ? PALETTE.ROSE_500 : PALETTE.SLATE_600
      }
    }
  })
)

const NavItemLabel = styled('span')({
  display: 'inline-block',
  fontSize: NavSidebar.FONT_SIZE,
  verticalAlign: 'middle'
})

const navListItemLinkActive = {
  backgroundColor: PALETTE.SLATE_100,
  borderLeftColor: PALETTE.GRAPE_700,
  borderRadius: '0 4px 4px 0',
  color: PALETTE.SLATE_700,
  cursor: 'default',
  ':hover,:focus': {
    backgroundColor: PALETTE.SLATE_100
  }
}

const navListItemLinkDisabled = {
  cursor: 'not-allowed',
  ':hover,:focus': {
    backgroundColor: 'transparent'
  }
}

interface LinkProps {
  isActive: boolean
  isCollapsible?: boolean
  isDisabled: boolean
  isFacilitatorPhase: boolean
  isUnsyncedFacilitatorStage?: boolean
}

const NavListItemLink = styled('div')<LinkProps>(
  {
    alignItems: 'center',
    borderRadius: '0 4px 4px 0',
    color: PALETTE.SLATE_700,
    cursor: 'pointer',
    display: 'flex',
    flexShrink: 0,
    marginRight: 8,
    minHeight: 40,
    textDecoration: 'none',
    userSelect: 'none',
    ':hover,:focus': {
      backgroundColor: PALETTE.SLATE_100
    }
  },
  ({isDisabled}) => isDisabled && navListItemLinkDisabled,
  ({isActive}) => isActive && navListItemLinkActive,
  ({isCollapsible, isActive}) =>
    isCollapsible &&
    isActive && {
      backgroundColor: 'transparent',
      ':hover,:focus': {
        cursor: 'pointer'
      }
    },
  ({isCollapsible, isFacilitatorPhase, isUnsyncedFacilitatorStage}) =>
    isCollapsible &&
    isFacilitatorPhase &&
    !isUnsyncedFacilitatorStage && {
      backgroundColor: 'transparent',
      cursor: 'default',
      ':hover,:focus': {
        backgroundColor: 'transparent',
        cursor: 'default'
      }
    }
)

const PhaseCountBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  marginLeft: 'auto'
})

const StyledBadge = styled(Badge)({
  backgroundColor: PALETTE.SLATE_600,
  boxShadow: 'none',
  marginRight: 8,
  minWidth: 24,
  textShadow: 'none'
})

interface Props {
  children?: ReactNode
  handleClick?: () => void
  isActive: boolean
  isCollapsible?: boolean
  isFacilitatorPhase: boolean
  isUnsyncedFacilitatorPhase: boolean
  isUnsyncedFacilitatorStage?: boolean
  phaseCount?: number | null
  phaseType: NewMeetingPhaseTypeEnum
}

const NewMeetingSidebarPhaseListItem = (props: Props) => {
  const {
    children,
    handleClick,
    isActive,
    isCollapsible,
    isFacilitatorPhase,
    isUnsyncedFacilitatorPhase,
    isUnsyncedFacilitatorStage,
    phaseCount,
    phaseType
  } = props
  const label = phaseLabelLookup[phaseType]
  const icon = phaseIconLookup[phaseType]
  const Image = phaseImageLookup[phaseType]
  const showPhaseCount = Boolean(phaseCount || phaseCount === 0)
  return (
    <NavListItem phaseType={phaseType}>
      <NavListItemLink
        isActive={isActive}
        isCollapsible={isCollapsible}
        isDisabled={!handleClick}
        isFacilitatorPhase={isFacilitatorPhase}
        isUnsyncedFacilitatorStage={isUnsyncedFacilitatorStage}
        onClick={handleClick}
        title={label}
      >
        {icon && (
          <NavItemIcon isUnsyncedFacilitatorPhase={isUnsyncedFacilitatorPhase}>{icon}</NavItemIcon>
        )}
        {Image && (
          <NavItemSVG isUnsyncedFacilitatorPhase={isUnsyncedFacilitatorPhase}>
            <Image />
          </NavItemSVG>
        )}
        <NavItemLabel>{label}</NavItemLabel>
        {showPhaseCount && (
          <PhaseCountBlock>
            <StyledBadge>{phaseCount}</StyledBadge>
          </PhaseCountBlock>
        )}
      </NavListItemLink>
      {children}
    </NavListItem>
  )
}

export default NewMeetingSidebarPhaseListItem
