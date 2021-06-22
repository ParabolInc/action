import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import SwipeableViews from 'react-swipeable-views'
import Icon from '../../../components/Icon'
import Tab from '../../../components/Tab/Tab'
import Tabs from '../../../components/Tabs/Tabs'
import {desktopSidebarShadow} from '../../../styles/elevation'
import {PALETTE} from '../../../styles/paletteV3'
import {PokerTemplateList_settings} from '../../../__generated__/PokerTemplateList_settings.graphql'
import PokerTemplateListOrgRoot from './PokerTemplateListOrgRoot'
import PokerTemplateListPublicRoot from './PokerTemplateListPublicRoot'
import PokerTemplateListTeam from './PokerTemplateListTeam'
import AddNewPokerTemplate from './AddNewPokerTemplate'

const WIDTH = 360
const TemplateSidebar = styled('div')({
  boxShadow: desktopSidebarShadow,
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  width: WIDTH,
  zIndex: 1 // show above template details to show box-shadow
})

const Label = styled('div')({
  color: PALETTE.SLATE_700,
  fontSize: 20,
  fontWeight: 600,
  lineHeight: '24px',
  paddingTop: 16,
  paddingLeft: 24,
  paddingBottom: 8
})

const StyledTabsBar = styled(Tabs)({
  boxShadow: `inset 0 -1px 0 ${PALETTE.SLATE_300}`
})

const FullTab = styled(Tab)({
  padding: '4px 0 8px',
  width: '30%'
})

const WideTab = styled(FullTab)({
  width: '40%'
})

const TabContents = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  height: '100%'
})

const TabLabel = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
})

const TabIcon = styled(Icon)({
  marginRight: 4
})

const containerStyle = {height: '100%'}
const innerStyle = {width: '100%', height: '100%'}
interface Props {
  activeIdx: number
  setActiveIdx: (idx: number) => void
  settings: PokerTemplateList_settings
}

const PokerTemplateList = (props: Props) => {
  const {activeIdx, setActiveIdx, settings} = props
  const {team, teamTemplates} = settings
  const {id: teamId} = team
  const activeTemplateId = settings.activeTemplate?.id ?? "-tmp"

  const gotoTeamTemplates = () => {
    setActiveIdx(0)
  }
  const gotoPublicTemplates = () => {
    setActiveIdx(2)
  }
  const onChangeIdx = (idx, _fromIdx, props: {reason: string}) => {
    //very buggy behavior, probably linked to the vertical scrolling.
    // to repro, go from team > org > team > org by clicking tabs & see this this get called for who knows why
    if (props.reason === 'focus') return
    setActiveIdx(idx)
  }
  return (
    <TemplateSidebar>
      <Label>Sprint Poker Templates</Label>
      <StyledTabsBar activeIdx={activeIdx}>
        <FullTab
          label={
            <TabLabel>
              <TabIcon>{'group'}</TabIcon> Team
            </TabLabel>
          }
          onClick={gotoTeamTemplates}
        />
        <WideTab
          label={
            <TabLabel>
              <TabIcon>{'business'}</TabIcon> Organization
            </TabLabel>
          }
          onClick={() => setActiveIdx(1)}
        />
        <FullTab
          label={
            <TabLabel>
              <TabIcon>{'public'}</TabIcon> Public
            </TabLabel>
          }
          onClick={gotoPublicTemplates}
        />
      </StyledTabsBar>
      <AddNewPokerTemplate teamId={teamId} pokerTemplates={teamTemplates} gotoTeamTemplates={gotoTeamTemplates} />
      <SwipeableViews
        enableMouseEvents
        index={activeIdx}
        onChangeIndex={onChangeIdx}
        containerStyle={containerStyle}
        style={innerStyle}
      >
        <TabContents>
          <PokerTemplateListTeam
            activeTemplateId={activeTemplateId}
            showPublicTemplates={gotoPublicTemplates}
            teamTemplates={teamTemplates}
            teamId={teamId}
            isActive={activeIdx === 0}
          />
        </TabContents>
        <TabContents>
          <PokerTemplateListOrgRoot teamId={teamId} isActive={activeIdx === 1} />
        </TabContents>
        <TabContents>
          <PokerTemplateListPublicRoot teamId={teamId} isActive={activeIdx === 2} />
        </TabContents>
      </SwipeableViews>
      {/* add a key to clear the error when they change */}
    </TemplateSidebar>
  )
}

export default createFragmentContainer(PokerTemplateList, {
  settings: graphql`
    fragment PokerTemplateList_settings on PokerMeetingSettings {
      id
      team {
        id
      }
      activeTemplate {
        ...getTemplateList_template
        id
        teamId
        orgId
      }
      teamTemplates {
        ...PokerTemplateListTeam_teamTemplates
        ...AddNewPokerTemplate_pokerTemplates
        id
      }
    }
  `
})
