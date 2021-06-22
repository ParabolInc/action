import React, {ReactElement, ReactNode} from 'react'
import styled from '@emotion/styled'
import DemoCreateAccountButton from './DemoCreateAccountButton'
import SidebarToggle from './SidebarToggle'
import isDemoRoute from '../utils/isDemoRoute'
import hasToken from '../utils/hasToken'
import {meetingAvatarMediaQueries} from '../styles/meeting'
import makeMinWidthMediaQuery from '../utils/makeMinWidthMediaQuery'
import PlainButton from './PlainButton/PlainButton'
import {PALETTE} from '~/styles/paletteV3'
import Icon from './Icon'
import {ICON_SIZE} from '~/styles/typographyV2'

const localHeaderBreakpoint = makeMinWidthMediaQuery(600)

const MeetingTopBarStyles = styled('div')({
  alignItems: 'flex-start',
  display: 'flex',
  flexShrink: 0,
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  margin: 0,
  maxWidth: '100%',
  paddingLeft: 16,
  paddingRight: 14, // compensate for overlapping block padding
  width: '100%',
  [meetingAvatarMediaQueries[0]]: {
    paddingRight: 13 // compensate for overlapping block padding
  }
})

const HeadingBlock = styled('div')<{isMeetingSidebarCollapsed: boolean}>(
  ({isMeetingSidebarCollapsed}) => ({
    alignItems: 'flex-start',
    display: 'flex',
    paddingLeft: isMeetingSidebarCollapsed ? undefined : 8,
    marginTop: 16,
    minHeight: 24,
    [localHeaderBreakpoint]: {
      flex: 1
    }
  })
)

const PrimaryActionBlock = styled('div')({
  alignItems: 'center',
  display: 'flex'
})

const AvatarGroupBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
  padding: '10px 0',
  [meetingAvatarMediaQueries[0]]: {
    minHeight: 76,
    padding: 0
  }
})

const ChildrenBlock = styled('div')({
  width: '100%'
})

const StyledSidebarToggle = styled(SidebarToggle)({
  marginRight: 16
})

const badgeSize = 10

const Badge = styled('div')({
  display: 'block',
  height: badgeSize,
  position: 'absolute',
  width: badgeSize,
  right: -1,
  top: -1,
  zIndex: 1,
  [meetingAvatarMediaQueries[0]]: {
    right: 2,
    top: 2
  },
  [meetingAvatarMediaQueries[1]]: {
    right: 3,
    top: 3
  }
})

const BadgeDot = styled('div')<{isCommentUnread: boolean}>(({isCommentUnread}) => ({
  backgroundColor: PALETTE.TOMATO_500,
  border: '1px solid rgba(255, 255, 255, .65)',
  borderRadius: badgeSize,
  display: isCommentUnread ? 'flex' : 'none',
  height: badgeSize,
  width: badgeSize
}))

const ButtonContainer = styled('div')({
  alignItems: 'center',
  alignContent: 'center',
  display: 'flex',
  height: 32,
  marginLeft: 11,
  position: 'relative',
  [meetingAvatarMediaQueries[0]]: {
    height: 48,
    marginLeft: 10
  },
  [meetingAvatarMediaQueries[1]]: {
    height: 56
  }
})

const DiscussionButton = styled(PlainButton)({
  alignItems: 'center',
  backgroundColor: PALETTE.GRAPE_700,
  borderRadius: '50%',
  display: 'flex',
  padding: 7,
  [meetingAvatarMediaQueries[0]]: {
    padding: 12
  },
  [meetingAvatarMediaQueries[1]]: {
    padding: 10
  }
})

const StyledIcon = styled(Icon)({
  color: '#FFFF',
  transform: 'scaleX(-1)',
  fontSize: ICON_SIZE.MD18,
  [meetingAvatarMediaQueries[0]]: {
    fontSize: ICON_SIZE.MD24
  },
  [meetingAvatarMediaQueries[1]]: {
    fontSize: ICON_SIZE.MD36
  }
})

interface Props {
  avatarGroup: ReactElement
  children?: ReactNode
  isCommentUnread?: boolean
  isMeetingSidebarCollapsed: boolean
  isRightDrawerOpen?: boolean
  toggleSidebar: () => void
  toggleDrawer?: () => void
}

const MeetingTopBar = (props: Props) => {
  const {
    avatarGroup,
    children,
    isCommentUnread = false,
    isMeetingSidebarCollapsed,
    isRightDrawerOpen,
    toggleDrawer,
    toggleSidebar
  } = props
  const showButton = isDemoRoute() && !hasToken()
  const showDiscussionButton = toggleDrawer && !isRightDrawerOpen
  return (
    <MeetingTopBarStyles>
      <HeadingBlock isMeetingSidebarCollapsed={isMeetingSidebarCollapsed}>
        {isMeetingSidebarCollapsed && (
          <StyledSidebarToggle dataCy='topbar' onClick={toggleSidebar} />
        )}
        <ChildrenBlock>{children}</ChildrenBlock>
      </HeadingBlock>
      <AvatarGroupBlock>
        {showButton && (
          <PrimaryActionBlock>
            <DemoCreateAccountButton />
          </PrimaryActionBlock>
        )}
        {avatarGroup}
        {showDiscussionButton && toggleDrawer && (
          <ButtonContainer>
            <Badge>
              <BadgeDot isCommentUnread={isCommentUnread} />
            </Badge>
            <DiscussionButton onClick={toggleDrawer}>
              <StyledIcon>comment</StyledIcon>
            </DiscussionButton>
          </ButtonContainer>
        )}
      </AvatarGroupBlock>
    </MeetingTopBarStyles>
  )
}
export default MeetingTopBar
