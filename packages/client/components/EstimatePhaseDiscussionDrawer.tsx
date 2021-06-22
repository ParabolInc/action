import styled from '@emotion/styled'
import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import {createFragmentContainer} from 'react-relay'
import {desktopSidebarShadow} from '~/styles/elevation'
import {EstimatePhaseDiscussionDrawer_meeting} from '~/__generated__/EstimatePhaseDiscussionDrawer_meeting.graphql'
import {BezierCurve, DiscussionThreadEnum, ZIndex} from '../types/constEnums'
import DiscussionThreadRoot from './DiscussionThreadRoot'
import {PALETTE} from '~/styles/paletteV3'
import LabelHeading from './LabelHeading/LabelHeading'
import PlainButton from './PlainButton/PlainButton'
import Icon from './Icon'
import {ICON_SIZE} from '~/styles/typographyV2'

const Drawer = styled('div')<{isDesktop: boolean; isOpen: boolean}>(({isDesktop, isOpen}) => ({
  boxShadow: isDesktop ? desktopSidebarShadow : undefined,
  backgroundColor: '#FFFFFF',
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  justifyContent: 'flex-start',
  overflow: 'hidden',
  position: isDesktop ? 'fixed' : 'static',
  bottom: 0,
  top: 0,
  right: isDesktop ? 0 : undefined,
  transition: `all 200ms ${BezierCurve.DECELERATE}`,
  userSelect: 'none',
  width: isOpen || !isDesktop ? DiscussionThreadEnum.WIDTH : 0,
  zIndex: ZIndex.SIDEBAR
}))

const ThreadColumn = styled('div')({
  alignItems: 'center',
  bottom: 0,
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  height: '100%',
  justifyContent: 'flex-end',
  maxWidth: 700,
  overflow: 'auto',
  position: 'relative',
  width: '100%'
})

const CloseIcon = styled(Icon)({
  color: PALETTE.SLATE_600,
  cursor: 'pointer',
  fontSize: ICON_SIZE.MD24,
  '&:hover': {
    opacity: 0.5
  }
})

const Header = styled('div')({
  alignItems: 'center',
  borderBottom: `1px solid ${PALETTE.SLATE_300}`,
  display: 'flex',
  justifyContent: 'space-between',
  padding: '8px 8px 8px 12px',
  width: '100%'
})

const HeaderLabel = styled(LabelHeading)({
  textTransform: 'none',
  width: '100%'
})

const StyledCloseButton = styled(PlainButton)({
  height: 24
})

interface Props {
  isDesktop: boolean
  isOpen: boolean
  meeting: EstimatePhaseDiscussionDrawer_meeting
  onToggle: () => void
}

const EstimatePhaseDiscussionDrawer = (props: Props) => {
  const {isDesktop, isOpen, meeting, onToggle} = props
  const {id: meetingId, localStage} = meeting
  const {serviceTaskId} = localStage

  return (
    <Drawer isDesktop={isDesktop} isOpen={isOpen}>
      <Header>
        <HeaderLabel>{'Discussion'}</HeaderLabel>
        <StyledCloseButton onClick={onToggle}>
          <CloseIcon>close</CloseIcon>
        </StyledCloseButton>
      </Header>
      <ThreadColumn>
        <DiscussionThreadRoot meetingId={meetingId} threadSourceId={serviceTaskId!} />
      </ThreadColumn>
    </Drawer>
  )
}

graphql`
  fragment EstimatePhaseDiscussionDrawerStage on EstimateStage {
    serviceTaskId
  }
`
export default createFragmentContainer(EstimatePhaseDiscussionDrawer, {
  meeting: graphql`
    fragment EstimatePhaseDiscussionDrawer_meeting on PokerMeeting {
      id
      endedAt
      localStage {
        ...EstimatePhaseDiscussionDrawerStage @relay(mask: false)
      }
    }
  `
})
