import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import SwipeableViews from 'react-swipeable-views'
import useBreakpoint from '~/hooks/useBreakpoint'
import {Breakpoint} from '~/types/constEnums'
import {ScopePhaseArea_meeting} from '~/__generated__/ScopePhaseArea_meeting.graphql'
import {Elevation} from '../styles/elevation'
import {PALETTE} from '../styles/paletteV3'
import GitHubSVG from './GitHubSVG'
import Icon from './Icon'
import JiraSVG from './JiraSVG'
import ScopePhaseAreaGitHub from './ScopePhaseAreaGitHub'
import ScopePhaseAreaJira from './ScopePhaseAreaJira'
import ScopePhaseAreaParabolScoping from './ScopePhaseAreaParabolScoping'
import Tab from './Tab/Tab'
import Tabs from './Tabs/Tabs'

interface Props {
  meeting: ScopePhaseArea_meeting
}

const ScopingArea = styled('div')<{isDesktop: boolean}>(({isDesktop}) => ({
  background: '#fff',
  borderRadius: 8,
  display: 'flex',
  flexDirection: 'column',
  margin: isDesktop ? undefined : '0 auto',
  width: isDesktop ? 640 : 'calc(100% - 16px)',
  height: 476,
  boxShadow: Elevation.Z3
}))

const StyledTabsBar = styled(Tabs)({
  boxShadow: `inset 0 -1px 0 ${PALETTE.SLATE_300}`,
  maxWidth: '100%'
})

const TabIcon = styled(Icon)({
  padding: '0px 4px'
})

const TabLabel = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minWidth: 80,
  whiteSpace: 'pre-wrap'
})

const TabContents = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  position: 'relative',
  overflow: 'hidden'
})

const containerStyle = {height: '100%'}
const innerStyle = {width: '100%', height: '100%'}

const tabs = [
  {icon: <GitHubSVG />, label: 'GitHub'},
  {icon: <JiraSVG />, label: 'Jira'},
  {icon: 'public', label: 'Parabol'}
]

const ScopePhaseArea = (props: Props) => {
  const {meeting} = props
  const [activeIdx, setActiveIdx] = useState(1)
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)

  const updateActiveIdx = (idx: number) => {
    setActiveIdx(idx)
  }
  const onChangeIdx = (idx, _fromIdx, props: {reason: string}) => {
    //very buggy behavior, probably linked to the vertical scrolling.
    // to repro, go from team > org > team > org by clicking tabs & see this this get called for who knows why
    if (props.reason === 'focus') return
    setActiveIdx(idx)
  }
  return (
    <ScopingArea isDesktop={isDesktop}>
      <StyledTabsBar activeIdx={activeIdx}>
        {tabs.map((tab, idx) => {
          return (
            <Tab
              key={tab.label}
              label={
                <TabLabel>
                  <TabIcon>{tab.icon}</TabIcon>
                  {tab.label}
                </TabLabel>
              }
              onClick={() => updateActiveIdx(idx)}
            />
          )
        })}
      </StyledTabsBar>
      <SwipeableViews
        enableMouseEvents={false} // disable because this works even if a modal is on top of it
        index={activeIdx}
        onChangeIndex={onChangeIdx}
        containerStyle={containerStyle}
        style={innerStyle}
      >
        <TabContents>
          <ScopePhaseAreaGitHub
            isActive={activeIdx === 0}
            gotoParabol={() => setActiveIdx(2)}
            meeting={meeting}
          />
        </TabContents>
        <TabContents>
          <ScopePhaseAreaJira
            isActive={activeIdx === 1}
            gotoParabol={() => setActiveIdx(2)}
            meeting={meeting}
          />
        </TabContents>
        <TabContents>
          <ScopePhaseAreaParabolScoping isActive={activeIdx === 2} meeting={meeting} />
        </TabContents>
      </SwipeableViews>
    </ScopingArea>
  )
}

graphql`
  fragment ScopePhaseArea_phase on GenericMeetingPhase {
    id
  }
`

export default createFragmentContainer(ScopePhaseArea, {
  meeting: graphql`
    fragment ScopePhaseArea_meeting on PokerMeeting {
      ...StageTimerDisplay_meeting
      ...StageTimerControl_meeting
      ...ScopePhaseAreaGitHub_meeting
      ...ScopePhaseAreaJira_meeting
      ...ScopePhaseAreaParabolScoping_meeting
      endedAt
      localPhase {
        ...ScopePhaseArea_phase @relay(mask: false)
      }
      localStage {
        isComplete
      }
      phases {
        ...ScopePhaseArea_phase @relay(mask: false)
      }
      showSidebar
    }
  `
})
