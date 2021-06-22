import {StandardHubUserMenu_viewer} from '../__generated__/StandardHubUserMenu_viewer.graphql'
import React from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import DropdownMenuLabel from './DropdownMenuLabel'
import Menu from './Menu'
import MenuItem from './MenuItem'
import MenuItemHR from './MenuItemHR'
import MenuItemIcon from './MenuItemIcon'
import MenuItemLabel from './MenuItemLabel'
import {MenuProps} from '../hooks/useMenu'
import {SIGNOUT_LABEL, SIGNOUT_SLUG} from '../utils/constants'
import {PALETTE} from '../styles/paletteV3'
import {TierLabel} from '../types/constEnums'

const UpgradeIcon = styled(MenuItemIcon)({
  color: PALETTE.SKY_500
})

const UpgradeCTA = styled('span')({
  color: PALETTE.SKY_500,
  fontSize: 15,
  lineHeight: '32px',
  marginRight: '2rem'
})

const TallMenu = styled(Menu)({
  maxHeight: 256
})

interface Props extends RouteComponentProps<{}> {
  menuProps: MenuProps
  viewer: StandardHubUserMenu_viewer | null
}

const StandardHubUserMenu = (props: Props) => {
  const {menuProps, history, viewer} = props
  if (!viewer) return null
  const {email, organizations} = viewer
  // nav menu routes
  const goToProfile = () => {
    history.push('/me/profile')
  }
  const goToOrganizations = () => {
    history.push('/me/organizations')
  }
  const signOut = () => {
    history.push(`/${SIGNOUT_SLUG}`)
  }

  const ownedFreeOrgs = organizations.filter((org) => org.tier === 'personal')
  const showUpgradeCTA = ownedFreeOrgs.length > 0

  const handleUpgradeClick = () => {
    const routeSuffix = ownedFreeOrgs.length === 1 ? `/${ownedFreeOrgs[0].id}` : ''
    history.push(`/me/organizations${routeSuffix}`)
  }

  return (
    <TallMenu ariaLabel={'Select your settings'} {...menuProps}>
      <DropdownMenuLabel>{email}</DropdownMenuLabel>
      <MenuItem
        label={
          <MenuItemLabel>
            <MenuItemIcon>account_box</MenuItemIcon>
            {'Profile'}
          </MenuItemLabel>
        }
        onClick={goToProfile}
      />
      <MenuItem
        label={
          <MenuItemLabel>
            <MenuItemIcon>account_balance</MenuItemIcon>
            {'Organizations'}
          </MenuItemLabel>
        }
        onClick={goToOrganizations}
      />
      {showUpgradeCTA && <MenuItemHR key='HR0' />}
      {showUpgradeCTA && (
        <MenuItem
          label={
            <MenuItemLabel>
              <UpgradeIcon>star</UpgradeIcon>
              <UpgradeCTA>
                {'Upgrade to '}
                <b>{TierLabel.PRO}</b>
              </UpgradeCTA>
            </MenuItemLabel>
          }
          onClick={handleUpgradeClick}
        />
      )}
      <MenuItemHR key='HR1' />
      <MenuItem
        label={
          <MenuItemLabel>
            <MenuItemIcon>exit_to_app</MenuItemIcon>
            {SIGNOUT_LABEL}
          </MenuItemLabel>
        }
        onClick={signOut}
      />
    </TallMenu>
  )
}

export default createFragmentContainer(withRouter(StandardHubUserMenu), {
  viewer: graphql`
    fragment StandardHubUserMenu_viewer on User {
      email
      organizations {
        id
        tier
      }
    }
  `
})
