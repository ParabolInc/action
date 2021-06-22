import graphql from 'babel-plugin-relay/macro'
import React, {forwardRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import {SuggestedIntegrationJiraMenuItem_suggestedIntegration} from '../__generated__/SuggestedIntegrationJiraMenuItem_suggestedIntegration.graphql'
import JiraSVG from './JiraSVG'
import MenuItem from './MenuItem'
import MenuItemLabel from './MenuItemLabel'
import SuggestedIntegrationMenuItemAvatar from './SuggestedIntegrationMenuItemAvatar'
import TypeAheadLabel from './TypeAheadLabel'

interface Props {
  suggestedIntegration: SuggestedIntegrationJiraMenuItem_suggestedIntegration
  onClick: () => void
  query: string
}

const SuggestedIntegrationJiraMenuItem = forwardRef((props: Props, ref: any) => {
  const {suggestedIntegration, onClick, query} = props
  const {projectName} = suggestedIntegration
  return (
    <MenuItem
      ref={ref}
      label={
        <MenuItemLabel data-cy={`jira-integration`}>
          <SuggestedIntegrationMenuItemAvatar>
            <JiraSVG />
          </SuggestedIntegrationMenuItemAvatar>
          <TypeAheadLabel query={query} label={projectName} />
        </MenuItemLabel>
      }
      onClick={onClick}
    />
  )
})

export default createFragmentContainer(SuggestedIntegrationJiraMenuItem, {
  suggestedIntegration: graphql`
    fragment SuggestedIntegrationJiraMenuItem_suggestedIntegration on SuggestedIntegrationJira {
      projectName
    }
  `
})
