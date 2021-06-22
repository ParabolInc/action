import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {PALETTE} from '~/styles/paletteV3'
import {ICON_SIZE} from '~/styles/typographyV2'
import {AppBar} from '~/types/constEnums'
import Icon from './Icon'
import PlainButton from './PlainButton/PlainButton'
import TopBarIcon from './TopBarIcon'
import TopBarMeetings from './TopBarMeetings'
import TopBarNotifications from './TopBarNotifications'
import TopBarHelp from './TopBarHelp'

interface Props {
  toggle: () => void
  viewer: any
}

const Wrapper = styled('header')({
  backgroundColor: PALETTE.GRAPE_700,
  display: 'flex',
  height: AppBar.HEIGHT,
  maxWidth: '100%'
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
  flex: 1,
  minWidth: 0
})

const TopBarIcons = styled('div')({
  alignItems: 'center',
  color: PALETTE.SLATE_200,
  display: 'flex',
  justifyContent: 'flex-end',
  maxWidth: 560,
  paddingRight: 16
})

const Title = styled('div')({
  fontSize: 20,
  overflow: 'hidden',
  paddingLeft: 16,
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
})

const MobileDashTopBar = (props: Props) => {
  const {toggle, viewer} = props
  const teams = viewer?.teams ?? []
  const pageName = viewer?.pageName ?? 'Parabol'
  return (
    <Wrapper>
      <LeftNavHeader>
        <LeftNavToggle onClick={toggle}>
          <Icon>{'menu'}</Icon>
        </LeftNavToggle>
        <Title>{pageName}</Title>
      </LeftNavHeader>
      <TopBarIcons>
        {/* Disable search in mobile for now */}
        {false && <TopBarIcon icon={'search'} />}
        <TopBarHelp />
        <TopBarNotifications viewer={viewer || null} />
        <TopBarMeetings teams={teams} />
      </TopBarIcons>
    </Wrapper>
  )
}

export default createFragmentContainer(MobileDashTopBar, {
  viewer: graphql`
    fragment MobileDashTopBar_viewer on User {
      ...TopBarNotifications_viewer
      pageName
      teams {
        ...TopBarMeetings_teams
      }
    }
  `
})
