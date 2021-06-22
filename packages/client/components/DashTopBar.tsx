import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useRouter from '~/hooks/useRouter'
import {PALETTE} from '~/styles/paletteV3'
import {ICON_SIZE} from '~/styles/typographyV2'
import {AppBar, Breakpoint, Layout, NavSidebar} from '~/types/constEnums'
import makeMinWidthMediaQuery from '~/utils/makeMinWidthMediaQuery'
import {DashTopBar_viewer} from '~/__generated__/DashTopBar_viewer.graphql'
import parabolLogo from '../styles/theme/images/brand/lockup_color_mark_white_type.svg'
import Icon from './Icon'
import PlainButton from './PlainButton/PlainButton'
import TopBarAvatar from './TopBarAvatar'
import TopBarHelp from './TopBarHelp'
import TopBarMeetings from './TopBarMeetings'
import TopBarNotifications from './TopBarNotifications'
import TopBarSearch from './TopBarSearch'

const dashWidestBreakpoint = makeMinWidthMediaQuery(Breakpoint.DASH_BREAKPOINT_WIDEST)

interface Props {
  toggle: () => void
  viewer: DashTopBar_viewer | null
}

const Wrapper = styled('header')({
  backgroundColor: PALETTE.GRAPE_700,
  display: 'flex',
  height: AppBar.HEIGHT,
  justifyContent: 'space-between',
  width: '100%',
  [dashWidestBreakpoint]: {
    paddingRight: NavSidebar.WIDTH
  }
})

const LeftNavToggle = styled(PlainButton)({
  fontSize: ICON_SIZE.MD24,
  lineHeight: '16px',
  paddingLeft: 16
})

const LeftNavHeader = styled('div')({
  alignItems: 'center',
  color: PALETTE.SLATE_200,
  display: 'flex',
  flexShrink: 0,
  width: NavSidebar.WIDTH
})

const Img = styled('img')({
  cursor: 'pointer',
  margin: '8px 16px'
})

const TopBarIcons = styled('div')({
  alignItems: 'center',
  color: PALETTE.SLATE_200,
  display: 'flex',
  justifyContent: 'flex-end',
  maxWidth: 560,
  paddingRight: 16
})

const TopBarMain = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  height: AppBar.HEIGHT,
  justifyContent: 'space-between',
  width: '100%',
  [dashWidestBreakpoint]: {
    margin: '0 auto',
    maxWidth: Layout.TASK_COLUMNS_MAX_WIDTH
  }
})

const DashTopBar = (props: Props) => {
  const {toggle, viewer} = props
  const {history} = useRouter()
  const teams = viewer?.teams ?? []
  const gotoHome = () => {
    history.push('/me')
  }
  return (
    <Wrapper>
      <LeftNavHeader>
        <LeftNavToggle onClick={toggle}>
          <Icon>{'menu'}</Icon>
        </LeftNavToggle>
        <Img onClick={gotoHome} crossOrigin='' src={parabolLogo} alt='' />
      </LeftNavHeader>
      <TopBarMain>
        <TopBarSearch viewer={viewer} />
        <TopBarIcons>
          <TopBarHelp />
          <TopBarNotifications viewer={viewer || null} />
          <TopBarMeetings teams={teams} />
          <TopBarAvatar viewer={viewer || null} />
        </TopBarIcons>
      </TopBarMain>
    </Wrapper>
  )
}

export default createFragmentContainer(DashTopBar, {
  viewer: graphql`
    fragment DashTopBar_viewer on User {
      ...TopBarAvatar_viewer
      ...TopBarSearch_viewer
      ...TopBarNotifications_viewer
      picture
      teams {
        ...TopBarMeetings_teams
      }
    }
  `
})
