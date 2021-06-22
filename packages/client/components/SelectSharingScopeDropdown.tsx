import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import useMutationProps from '../hooks/useMutationProps'
import UpdateReflectTemplateScopeMutation from '../mutations/UpdateReflectTemplateScopeMutation'
import UpdatePokerTemplateScopeMutation from '../mutations/UpdatePokerTemplateScopeMutation'
import {SelectSharingScopeDropdown_template} from '../__generated__/SelectSharingScopeDropdown_template.graphql'
import DropdownMenuIconItemLabel from './DropdownMenuIconItemLabel'
import Menu from './Menu'
import MenuItem from './MenuItem'

interface Props {
  menuProps: MenuProps
  template: SelectSharingScopeDropdown_template
}

const SelectSharingScopeDropdown = (props: Props) => {
  const {menuProps, template} = props
  const atmosphere = useAtmosphere()
  const {submitting, submitMutation, onError, onCompleted} = useMutationProps()
  const {id: templateId, scope, team, type} = template
  const {name: teamName, organization} = team
  const {name: orgName} = organization
  const setScope = (newScope: any) => () => {
    if (submitting) return
    submitMutation()
    if (type === 'retrospective') {
      UpdateReflectTemplateScopeMutation(
        atmosphere,
        {scope: newScope, templateId},
        {onError, onCompleted}
      )
    } else if (type === 'poker') {
      UpdatePokerTemplateScopeMutation(
        atmosphere,
        {scope: newScope, templateId},
        {onError, onCompleted}
      )
    }
  }
  return (
    <Menu ariaLabel={'Select the suitable scope for sharing'} {...menuProps}>
      {scope === 'TEAM' ? null : (
        <MenuItem
          label={<DropdownMenuIconItemLabel label={`Share only with ${teamName}`} icon={'group'} />}
          onClick={setScope('TEAM')}
        />
      )}
      {scope === 'ORGANIZATION' ? null : (
        <MenuItem
          label={
            <DropdownMenuIconItemLabel label={`Share with all of ${orgName}`} icon={'business'} />
          }
          onClick={setScope('ORGANIZATION')}
        />
      )}
      {scope === 'PUBLIC' ? null : (
        <MenuItem
          label={<DropdownMenuIconItemLabel label={`Share with the world`} icon={'public'} />}
          onClick={setScope('PUBLIC')}
        />
      )}
    </Menu>
  )
}

export default createFragmentContainer(SelectSharingScopeDropdown, {
  template: graphql`
    fragment SelectSharingScopeDropdown_template on MeetingTemplate {
      id
      scope
      type
      team {
        name
        organization {
          name
        }
      }
    }
  `
})
