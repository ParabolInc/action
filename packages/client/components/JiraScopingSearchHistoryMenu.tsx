import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import SearchQueryId from '../shared/gqlIds/SearchQueryId'
import {PALETTE} from '../styles/paletteV3'
import {JiraScopingSearchHistoryMenu_teamMember} from '../__generated__/JiraScopingSearchHistoryMenu_teamMember.graphql'
import Menu from './Menu'
import MenuItem from './MenuItem'
import MenuItemLabel from './MenuItemLabel'

const NoResults = styled(MenuItemLabel)({
  color: PALETTE.SLATE_600,
  justifyContent: 'center',
  paddingLeft: 8,
  paddingRight: 8,
  fontStyle: 'italic'
})

const QueryString = styled('span')({
  color: PALETTE.SLATE_600
})

const ProjectFilter = styled('span')({
  color: PALETTE.SLATE_600
})

const StyledMenuItemLabel = styled(MenuItemLabel)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start'
})

interface Props {
  menuProps: MenuProps
  teamMember: JiraScopingSearchHistoryMenu_teamMember
  meetingId: string
}

const JiraScopingSearchHistoryMenu = (props: Props) => {
  const {menuProps, meetingId, teamMember} = props
  const {integrations} = teamMember
  const {atlassian} = integrations
  const {jiraSearchQueries} = atlassian!
  const atmosphere = useAtmosphere()
  const {portalStatus, isDropdown, closePortal} = menuProps
  return (
    <Menu
      keepParentFocus
      ariaLabel={'Select a Jira search query'}
      portalStatus={portalStatus}
      isDropdown={isDropdown}
      closePortal={closePortal}
    >
      {jiraSearchQueries.length === 0 && (
        <NoResults key='no-results'>No saved queries yet!</NoResults>
      )}
      {jiraSearchQueries.map((jiraSearchQuery) => {
        const {id: queryId, queryString, isJQL, projectKeyFilters} = jiraSearchQuery
        const selectQuery = () => {
          commitLocalUpdate(atmosphere, (store) => {
            const searchQueryId = SearchQueryId.join('jira', meetingId)
            const jiraSearchQuery = store.get(searchQueryId)!
            jiraSearchQuery.setValue(isJQL, 'isJQL')
            jiraSearchQuery.setValue(queryString, 'queryString')
            jiraSearchQuery.setValue(projectKeyFilters as string[], 'projectKeyFilters')
          })
        }
        const queryStringLabel = isJQL ? queryString : `“${queryString}”`
        const projectFilters = projectKeyFilters
          .map((filter) => filter.slice(filter.indexOf(':') + 1))
          .join(', ')
        return (
          <MenuItem
            key={queryId}
            label={
              <StyledMenuItemLabel>
                <QueryString>{queryStringLabel}</QueryString>
                {projectFilters && <ProjectFilter>{`in ${projectFilters}`}</ProjectFilter>}
              </StyledMenuItemLabel>
            }
            onClick={selectQuery}
          />
        )
      })}
    </Menu>
  )
}

export default createFragmentContainer(JiraScopingSearchHistoryMenu, {
  teamMember: graphql`
    fragment JiraScopingSearchHistoryMenu_teamMember on TeamMember {
      integrations {
        atlassian {
          jiraSearchQueries {
            id
            queryString
            isJQL
            projectKeyFilters
          }
        }
      }
    }
  `
})
