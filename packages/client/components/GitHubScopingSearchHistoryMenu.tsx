import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import {PALETTE} from '../styles/paletteV2'
import {GitHubScopingSearchHistoryMenu_teamMember} from '../__generated__/GitHubScopingSearchHistoryMenu_teamMember.graphql'
import Menu from './Menu'
import MenuItem from './MenuItem'
import MenuItemLabel from './MenuItemLabel'

const NoResults = styled(MenuItemLabel)({
  color: PALETTE.TEXT_GRAY,
  justifyContent: 'center',
  paddingLeft: 8,
  paddingRight: 8,
  fontStyle: 'italic'
})

const QueryString = styled('span')({
  color: PALETTE.TEXT_GRAY
})

const ProjectFilter = styled('span')({
  color: PALETTE.TEXT_GRAY
})

const StyledMenuItemLabel = styled(MenuItemLabel)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start'
})

interface Props {
  menuProps: MenuProps
  teamMember: GitHubScopingSearchHistoryMenu_teamMember
  meetingId: string
}

const GitHubScopingSearchHistoryMenu = (props: Props) => {
  const {menuProps, meetingId, teamMember} = props
  const {integrations} = teamMember
  const {github} = integrations
  const {githubSearchQueries} = github!
  const atmosphere = useAtmosphere()
  const {portalStatus, isDropdown, closePortal} = menuProps
  return (
    <Menu
      keepParentFocus
      ariaLabel={'Select a GitHub search query'}
      portalStatus={portalStatus}
      isDropdown={isDropdown}
      closePortal={closePortal}
    >
      {githubSearchQueries.length === 0 && (
        <NoResults key='no-results'>No saved queries yet!</NoResults>
      )}
      {githubSearchQueries.map((githubSearchQuery) => {
        const {id: queryId, queryString, isJQL, nameWithOwnerFilters} = githubSearchQuery
        const selectQuery = () => {
          commitLocalUpdate(atmosphere, (store) => {
            const searchQueryId = `githubSearchQuery:${meetingId}`
            const githubSearchQuery = store.get(searchQueryId)!
            githubSearchQuery.setValue(isJQL, 'isJQL')
            githubSearchQuery.setValue(queryString, 'queryString')
            githubSearchQuery.setValue(nameWithOwnerFilters as string[], 'nameWithOwnerFilters')
          })
        }
        const queryStringLabel = isJQL ? queryString : `“${queryString}”`
        const filters = nameWithOwnerFilters
          .map((filter) => filter.slice(filter.indexOf(':') + 1))
          .join(', ')
        return (
          <MenuItem
            key={queryId}
            label={
              <StyledMenuItemLabel>
                <QueryString>{queryStringLabel}</QueryString>
                {filters && <ProjectFilter>{`in ${filters}`}</ProjectFilter>}
              </StyledMenuItemLabel>
            }
            onClick={selectQuery}
          />
        )
      })}
    </Menu>
  )
}

export default createFragmentContainer(GitHubScopingSearchHistoryMenu, {
  teamMember: graphql`
    fragment GitHubScopingSearchHistoryMenu_teamMember on TeamMember {
      integrations {
        github {
          githubSearchQueries {
            id
            queryString
            nameWithOwnerFilters
          }
        }
      }
    }
  `
})
