import {SlackProviderRow_viewer} from '../../../../__generated__/SlackProviderRow_viewer.graphql'
import React from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import FlatButton from '../../../../components/FlatButton'
import SlackConfigMenu from '../../../../components/SlackConfigMenu'
import SlackProviderLogo from '../../../../components/SlackProviderLogo'
import SlackSVG from '../../../../components/SlackSVG'
import Icon from '../../../../components/Icon'
import ProviderCard from '../../../../components/ProviderCard'
import ProviderActions from '../../../../components/ProviderActions'
import RowInfo from '../../../../components/Row/RowInfo'
import RowInfoCopy from '../../../../components/Row/RowInfoCopy'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import {PALETTE} from '../../../../styles/paletteV3'
import {ICON_SIZE} from '../../../../styles/typographyV2'
import {Breakpoint, Layout, Providers} from '../../../../types/constEnums'
import useMutationProps, {MenuMutationProps} from '../../../../hooks/useMutationProps'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import SlackClientManager from '../../../../utils/SlackClientManager'
import SlackNotificationList from './SlackNotificationList'
import useBreakpoint from '../../../../hooks/useBreakpoint'

const StyledButton = styled(FlatButton)({
  borderColor: PALETTE.SLATE_400,
  color: PALETTE.SLATE_700,
  fontSize: 14,
  fontWeight: 600,
  minWidth: 36,
  paddingLeft: 0,
  paddingRight: 0,
  width: '100%'
})

interface Props {
  teamId: string
  viewer: SlackProviderRow_viewer
}

const MenuButton = styled(FlatButton)({
  color: PALETTE.GRAPE_700,
  fontSize: ICON_SIZE.MD18,
  height: 24,
  userSelect: 'none',
  marginLeft: 4,
  padding: 0,
  width: 24
})

const StyledIcon = styled(Icon)({
  fontSize: ICON_SIZE.MD18
})

const ListAndMenu = styled('div')({
  display: 'flex',
  position: 'absolute',
  right: 16,
  top: 16
})

const SlackLogin = styled('div')({})

const ProviderName = styled('div')({
  color: PALETTE.SLATE_700,
  fontSize: 16,
  fontWeight: 600,
  lineHeight: '24px',
  alignItems: 'center',
  display: 'flex',
  marginRight: 16,
  verticalAlign: 'middle'
})

const CardTop = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  padding: Layout.ROW_GUTTER
})

const ExtraProviderCard = styled(ProviderCard)({
  flexDirection: 'column',
  padding: 0
})

const SlackProviderRow = (props: Props) => {
  const {viewer, teamId} = props
  const atmosphere = useAtmosphere()
  const {submitting, submitMutation, onError, onCompleted} = useMutationProps()
  const mutationProps = {submitting, submitMutation, onError, onCompleted} as MenuMutationProps
  const {teamMember} = viewer
  const {integrations} = teamMember!
  const {slack} = integrations
  const botAccessToken = slack?.botAccessToken ?? undefined
  const openOAuth = () => {
    SlackClientManager.openOAuth(atmosphere, teamId, mutationProps)
  }
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT)
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  return (
    <ExtraProviderCard>
      <CardTop>
        <SlackProviderLogo />
        <RowInfo>
          <ProviderName>{Providers.SLACK_NAME}</ProviderName>
          <RowInfoCopy>{Providers.SLACK_DESC}</RowInfoCopy>
        </RowInfo>
        {!botAccessToken && (
          <ProviderActions>
            <StyledButton onClick={openOAuth} palette='warm' waiting={submitting}>
              {isDesktop ? 'Connect' : <Icon>add</Icon>}
            </StyledButton>
          </ProviderActions>
        )}
        {botAccessToken && (
          <ListAndMenu>
            <SlackLogin title={slack!.slackTeamName || 'Slack'}>
              <SlackSVG />
            </SlackLogin>
            <MenuButton onClick={togglePortal} ref={originRef}>
              <StyledIcon>more_vert</StyledIcon>
            </MenuButton>
            {menuPortal(
              <SlackConfigMenu
                menuProps={menuProps}
                mutationProps={mutationProps}
                teamId={teamId}
              />
            )}
          </ListAndMenu>
        )}
      </CardTop>
      {botAccessToken && <SlackNotificationList teamId={teamId} viewer={viewer} />}
    </ExtraProviderCard>
  )
}

graphql`
  fragment SlackProviderRowViewer on User {
    ...SlackNotificationList_viewer
    teamMember(teamId: $teamId) {
      integrations {
        slack {
          botAccessToken
          slackTeamName
          slackUserName
        }
      }
    }
  }
`

export default createFragmentContainer(SlackProviderRow, {
  viewer: graphql`
    fragment SlackProviderRow_viewer on User {
      ...SlackProviderRowViewer @relay(mask: false)
    }
  `
})
