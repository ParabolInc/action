import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import Icon from '../../../components/Icon'
import {MenuPosition} from '../../../hooks/useCoords'
import useMenu from '../../../hooks/useMenu'
import useTooltip from '../../../hooks/useTooltip'
import {PALETTE} from '../../../styles/paletteV3'
import {ICON_SIZE} from '../../../styles/typographyV2'
import lazyPreload from '../../../utils/lazyPreload'
import {TemplateSharing_template} from '../../../__generated__/TemplateSharing_template.graphql'

const SelectSharingScopeDropdown = lazyPreload(() =>
  import(
    /* webpackChunkName: 'SelectSharingScopeDropdown' */
    '../../../components/SelectSharingScopeDropdown'
  )
)

const HR = styled('hr')({
  backgroundColor: PALETTE.SLATE_400,
  border: 'none',
  flexShrink: 0,
  height: 1,
  margin: 0,
  marginLeft: 56,
  padding: 0
})

const DropdownDecoratorIcon = styled(Icon)({
  color: PALETTE.SLATE_600,
  fontSize: ICON_SIZE.MD18,
  height: ICON_SIZE.MD24,
  lineHeight: ICON_SIZE.MD24,
  margin: '8px 16px',
  width: ICON_SIZE.MD24
})

const DropdownLabel = styled('div')({
  color: 'inherit'
})

const DropdownIcon = styled(Icon)({
  color: 'inherit',
  padding: 8,
  fontSize: ICON_SIZE.MD24
})

const DropdownBlock = styled('div')<{disabled: boolean}>(({disabled}) => ({
  color: PALETTE.SLATE_700,
  cursor: disabled ? 'not-allowed' : 'pointer',
  alignItems: 'center',
  display: 'flex',
  fontSize: 16,
  lineHeight: '24px',
  margin: '8px auto 8px 0',
  userSelect: 'none',
  ':hover': {
    color: disabled ? undefined : PALETTE.SLATE_900
  }
}))

interface Props {
  teamId: string
  template: TemplateSharing_template
}

const TemplateSharing = (props: Props) => {
  const {template, teamId} = props
  const {scope, team} = template
  const {name: teamName, organization, isLead} = team
  const {name: orgName} = organization
  const isOwner = teamId === template.teamId
  const {togglePortal, menuPortal, originRef, menuProps} = useMenu<HTMLDivElement>(
    MenuPosition.UPPER_LEFT,
    {
      isDropdown: true,
      id: 'sharingScopeDropdown',
      parentId: 'templateModal',
      menuContentStyles: {
        minWidth: 320
      }
    }
  )
  const {openTooltip, tooltipPortal, closeTooltip, originRef: tooltipRef} = useTooltip<
    HTMLDivElement
  >(MenuPosition.LOWER_CENTER, {
    disabled: isLead
  })
  if (!isOwner) return null
  const label =
    scope === 'TEAM'
      ? `Only visible to ${teamName}`
      : scope === 'ORGANIZATION'
        ? `Sharing with ${orgName}`
        : 'Sharing publicly'
  return (
    <>
      <HR />
      <DropdownBlock
        onMouseEnter={SelectSharingScopeDropdown.preload}
        onClick={isLead ? togglePortal : undefined}
        ref={isLead ? originRef : tooltipRef}
        disabled={!isLead}
        onMouseOver={openTooltip}
        onMouseLeave={closeTooltip}
      >
        <DropdownDecoratorIcon>{'share'}</DropdownDecoratorIcon>
        <DropdownLabel>{label}</DropdownLabel>
        <DropdownIcon>{'expand_more'}</DropdownIcon>
      </DropdownBlock>
      {menuPortal(<SelectSharingScopeDropdown menuProps={menuProps} template={template} />)}
      {tooltipPortal(<div>Must be Team Lead to change</div>)}
    </>
  )
}

export default createFragmentContainer(TemplateSharing, {
  template: graphql`
    fragment TemplateSharing_template on MeetingTemplate {
      ...SelectSharingScopeDropdown_template
      id
      scope
      teamId
      team {
        isLead
        name
        organization {
          name
        }
      }
    }
  `
})
