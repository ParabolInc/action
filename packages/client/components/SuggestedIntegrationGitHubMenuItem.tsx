import graphql from 'babel-plugin-relay/macro'
import React, {forwardRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import {SuggestedIntegrationGitHubMenuItem_suggestedIntegration} from '../__generated__/SuggestedIntegrationGitHubMenuItem_suggestedIntegration.graphql'
import GitHubSVG from './GitHubSVG'
import MenuItem from './MenuItem'
import MenuItemLabel from './MenuItemLabel'
import SuggestedIntegrationMenuItemAvatar from './SuggestedIntegrationMenuItemAvatar'
import TypeAheadLabel from './TypeAheadLabel'

interface Props {
  suggestedIntegration: SuggestedIntegrationGitHubMenuItem_suggestedIntegration
  onClick: () => void
  query: string
}

const SuggestedIntegrationGitHubMenuItem = forwardRef((props: Props, ref: any) => {
  const {query, suggestedIntegration, onClick} = props
  const {nameWithOwner} = suggestedIntegration
  return (
    <MenuItem
      ref={ref}
      label={
        <MenuItemLabel>
          <SuggestedIntegrationMenuItemAvatar>
            <GitHubSVG />
          </SuggestedIntegrationMenuItemAvatar>
          <TypeAheadLabel query={query} label={nameWithOwner} />
        </MenuItemLabel>
      }
      onClick={onClick}
    />
  )
})

export default createFragmentContainer(SuggestedIntegrationGitHubMenuItem, {
  suggestedIntegration: graphql`
    fragment SuggestedIntegrationGitHubMenuItem_suggestedIntegration on SuggestedIntegrationGitHub {
      nameWithOwner
    }
  `
})
