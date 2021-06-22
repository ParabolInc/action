import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import FlatButton from '../../../../components/FlatButton'
import GitHubConfigMenu from '../../../../components/GitHubConfigMenu'
import GitHubProviderLogo from '../../../../components/GitHubProviderLogo'
import GitHubSVG from '../../../../components/GitHubSVG'
import Icon from '../../../../components/Icon'
import ProviderActions from '../../../../components/ProviderActions'
import ProviderCard from '../../../../components/ProviderCard'
import RowInfo from '../../../../components/Row/RowInfo'
import RowInfoCopy from '../../../../components/Row/RowInfoCopy'
import withAtmosphere, {WithAtmosphereProps} from '../../../../decorators/withAtmosphere/withAtmosphere'
import useBreakpoint from '../../../../hooks/useBreakpoint'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import {MenuMutationProps} from '../../../../hooks/useMutationProps'
import {PALETTE} from '../../../../styles/paletteV3'
import {ICON_SIZE} from '../../../../styles/typographyV2'
import {Breakpoint, Providers} from '../../../../types/constEnums'
import GitHubClientManager from '../../../../utils/GitHubClientManager'
import withMutationProps, {WithMutationProps} from '../../../../utils/relay/withMutationProps'
import {GitHubProviderRow_viewer} from '../../../../__generated__/GitHubProviderRow_viewer.graphql'

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

interface Props extends WithAtmosphereProps, WithMutationProps, RouteComponentProps<{}> {
  teamId: string
  viewer: GitHubProviderRow_viewer
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

const GitHubLogin = styled('div')({})

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

const GitHubProviderRow = (props: Props) => {
  const {atmosphere, viewer, teamId, submitting, submitMutation, onError, onCompleted} = props
  const mutationProps = {submitting, submitMutation, onError, onCompleted} as MenuMutationProps
  const {teamMember} = viewer
  const {integrations} = teamMember!
  const {github} = integrations
  const accessToken = github?.accessToken ?? undefined
  const openOAuth = () => {
    GitHubClientManager.openOAuth(atmosphere, teamId, mutationProps)
  }
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT)
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  return (
    <ProviderCard>
      <GitHubProviderLogo />
      <RowInfo>
        <ProviderName>{Providers.GITHUB_NAME}</ProviderName>
        <RowInfoCopy>{Providers.GITHUB_DESC}</RowInfoCopy>
      </RowInfo>
      {!accessToken && (
        <ProviderActions>
          <StyledButton key='linkAccount' onClick={openOAuth} palette='warm' waiting={submitting}>
            {isDesktop ? 'Connect' : <Icon>add</Icon>}
          </StyledButton>
        </ProviderActions>
      )}
      {accessToken && (
        <ListAndMenu>
          <GitHubLogin title={github!.login}>
            <GitHubSVG />
          </GitHubLogin>
          <MenuButton onClick={togglePortal} ref={originRef}>
            <StyledIcon>more_vert</StyledIcon>
          </MenuButton>
          {menuPortal(
            <GitHubConfigMenu menuProps={menuProps} mutationProps={mutationProps} teamId={teamId} />
          )}
        </ListAndMenu>
      )}
    </ProviderCard>
  )
}

graphql`
  fragment GitHubProviderRowGitHubIntegration on GitHubIntegration {
    accessToken
    login
  }
`

export default createFragmentContainer(
  withAtmosphere(withMutationProps(withRouter(GitHubProviderRow))),
  {
    viewer: graphql`
      fragment GitHubProviderRow_viewer on User {
        teamMember(teamId: $teamId) {
          integrations {
            github {
              ...GitHubProviderRowGitHubIntegration @relay(mask: false)
            }
          }
        }
      }
    `
  }
)
