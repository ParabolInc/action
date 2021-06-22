import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useCallback, useRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import useAllIntegrations from '~/hooks/useAllIntegrations'
import useAtmosphere from '~/hooks/useAtmosphere'
import useFilteredItems from '~/hooks/useFilteredItems'
import useForm from '~/hooks/useForm'
import {MenuProps} from '~/hooks/useMenu'
import {PALETTE} from '~/styles/paletteV2'
import {ICON_SIZE} from '~/styles/typographyV2'
import {NewGitHubIssueMenu_suggestedIntegrations} from '~/__generated__/NewGitHubIssueMenu_suggestedIntegrations.graphql'
import Icon from './Icon'
import Menu from './Menu'
import MenuItemComponentAvatar from './MenuItemComponentAvatar'
import MenuItemLabel from './MenuItemLabel'
import SuggestedIntegrationGitHubMenuItem from './SuggestedIntegrationGitHubMenuItem'

const NoResults = styled(MenuItemLabel)({
  color: PALETTE.TEXT_GRAY,
  justifyContent: 'center',
  paddingLeft: 8,
  paddingRight: 8,
  fontStyle: 'italic'
})

const SearchItem = styled(MenuItemLabel)({
  margin: '0 8px 8px',
  overflow: 'visible',
  padding: 0,
  position: 'relative'
})

const StyledMenuItemIcon = styled(MenuItemComponentAvatar)({
  position: 'absolute',
  left: 8,
  margin: 0,
  pointerEvents: 'none',
  top: 4
})

const SearchIcon = styled(Icon)({
  color: PALETTE.TEXT_GRAY,
  fontSize: ICON_SIZE.MD18
})

const Input = styled('input')({
  appearance: 'none',
  background: 'inherit',
  border: `1px solid ${PALETTE.BORDER_LIGHT}`,
  borderRadius: 2,
  display: 'block',
  fontSize: 14,
  lineHeight: '24px',
  outline: 'none',
  padding: '3px 0 3px 39px',
  width: '100%',
  '&:focus, &:active': {
    border: `1px solid ${PALETTE.BORDER_BLUE}`,
    boxShadow: `0 0 1px 1px ${PALETTE.BORDER_BLUE_LIGHT}`
  }
})

interface Props {
  handleSelectNameWithOwner: (key: string) => void
  menuProps: MenuProps
  suggestedIntegrations: NewGitHubIssueMenu_suggestedIntegrations
  teamId: string
  userId: string
}

const getValue = (item: {projectName?: string; nameWithOwner?: string}) => {
  const repoName = item.projectName || item.nameWithOwner || 'Unknown Project'
  return repoName.toLowerCase()
}

const NewGitHubIssueMenu = (props: Props) => {
  const {handleSelectNameWithOwner, menuProps, suggestedIntegrations, teamId, userId} = props
  const {hasMore, items} = suggestedIntegrations
  const {fields, onChange} = useForm({
    search: {
      getDefault: () => ''
    }
  })
  const atmosphere = useAtmosphere()
  const {search} = fields
  const {value} = search
  const query = value.toLowerCase()
  const filteredIntegrations = useFilteredItems(query, items!, getValue)
  const {allItems, status} = useAllIntegrations(
    atmosphere,
    query,
    filteredIntegrations,
    !!hasMore,
    teamId,
    userId
  )

  const ref = useRef<HTMLInputElement>(null)
  const onBlur = useCallback(() => {
    ref.current && ref.current.focus()
  }, [])

  return (
    <Menu
      ariaLabel='Select GitHub project'
      keepParentFocus
      {...menuProps}
      resetActiveOnChanges={[allItems]}
    >
      <SearchItem>
        <StyledMenuItemIcon>
          <SearchIcon>search</SearchIcon>
        </StyledMenuItemIcon>
        <Input
          autoFocus
          autoComplete='off'
          name='search'
          onBlur={onBlur}
          onChange={onChange}
          placeholder='Search GitHub'
          ref={ref}
          type='text'
        />
      </SearchItem>
      {(query && allItems.length === 0 && status !== 'loading' && (
        <NoResults key='no-results'>No integrations found!</NoResults>
      )) ||
        null}

      {allItems.slice(0, 10).map((suggestedIntegration) => {
        const {id, service} = suggestedIntegration
        if (service === 'github') {
          const {nameWithOwner} = suggestedIntegration
          const onClick = () => {
            handleSelectNameWithOwner(nameWithOwner)
          }
          return (
            <SuggestedIntegrationGitHubMenuItem
              key={id}
              query={query}
              suggestedIntegration={suggestedIntegration}
              onClick={onClick}
            />
          )
        }
        return null
      })}
    </Menu>
  )
}

export default createFragmentContainer(NewGitHubIssueMenu, {
  suggestedIntegrations: graphql`
    fragment NewGitHubIssueMenu_suggestedIntegrations on SuggestedIntegrationQueryPayload {
      hasMore
      items {
        ... on SuggestedIntegrationGitHub {
          id
          nameWithOwner
          service
        }
        ...SuggestedIntegrationGitHubMenuItem_suggestedIntegration
      }
    }
  `
})
