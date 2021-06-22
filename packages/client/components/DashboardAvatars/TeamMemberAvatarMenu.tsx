import {TeamMemberAvatarMenu_teamMember} from '../../__generated__/TeamMemberAvatarMenu_teamMember.graphql'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import Menu from '../Menu'
import MenuItem from '../MenuItem'
import withAtmosphere, {WithAtmosphereProps} from '../../decorators/withAtmosphere/withAtmosphere'
import {MenuProps} from '../../hooks/useMenu'
import {PALETTE} from '../../styles/paletteV3'
import MenuItemLabel from '../MenuItemLabel'
import styled from '@emotion/styled'
import RoleTag from '~/components/Tag/RoleTag'

interface Props extends WithAtmosphereProps {
  isLead: boolean
  isViewerLead: boolean
  teamMember: TeamMemberAvatarMenu_teamMember
  menuProps: MenuProps
  handleNavigate?: () => void
  togglePromote: () => void
  toggleRemove: () => void
  toggleLeave: () => void
}

const Header = styled('div')<{hasOptions: boolean}>(({hasOptions}) => ({
  borderBottom: hasOptions ? `1px solid ${PALETTE.SLATE_300}` : undefined,
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: hasOptions ? 8 : 0,
  padding: hasOptions ? '4px 16px 12px' : '4px 16px',
  width: '100%'
}))

const NameAndMeta = styled('div')({
  paddingRight: 8
})

const Name = styled('div')({
  fontSize: 15,
  fontWeight: 600,
  lineHeight: '24px'
})

const Meta = styled('div')({
  color: PALETTE.SLATE_600,
  fontSize: 12,
  lineHeight: '16px',
  textTransform: 'capitalize'
})

const StyledRoleTag = styled(RoleTag)({
  marginTop: 4
})

const TeamMemberAvatarMenu = (props: Props) => {
  const {
    atmosphere,
    isLead,
    isViewerLead,
    teamMember,
    menuProps,
    togglePromote,
    toggleRemove,
    toggleLeave
  } = props
  const {user, preferredName, userId} = teamMember
  const {isConnected} = user
  const {viewerId} = atmosphere
  const isSelf = userId === viewerId
  const connected = isConnected ? 'connected' : 'disconnected'
  const hasOptions = (isViewerLead && !isSelf) || (!isViewerLead && isSelf)

  return (
    <>
      <Menu ariaLabel={'Select what to do with this team member'} {...menuProps}>
        <Header hasOptions={hasOptions}>
          <NameAndMeta>
            <Name>{preferredName}</Name>
            <Meta>{connected}</Meta>
          </NameAndMeta>
          {isLead && <StyledRoleTag>{'Team Lead'}</StyledRoleTag>}
        </Header>
        {isViewerLead && !isSelf && (
          <MenuItem
            key='promote'
            onClick={togglePromote}
            label={<MenuItemLabel>Promote {preferredName} to Team Lead</MenuItemLabel>}
          />
        )}
        {isViewerLead && !isSelf && (
          <MenuItem
            key='remove'
            onClick={toggleRemove}
            label={<MenuItemLabel>Remove {preferredName} from Team</MenuItemLabel>}
          />
        )}
        {!isViewerLead && isSelf && (
          <MenuItem
            key='leave'
            onClick={toggleLeave}
            label={<MenuItemLabel>Leave Team</MenuItemLabel>}
          />
        )}
      </Menu>
    </>
  )
}

export default createFragmentContainer(withAtmosphere(TeamMemberAvatarMenu), {
  teamMember: graphql`
    fragment TeamMemberAvatarMenu_teamMember on TeamMember {
      isSelf
      preferredName
      userId
      isLead
      user {
        isConnected
      }
    }
  `
})
