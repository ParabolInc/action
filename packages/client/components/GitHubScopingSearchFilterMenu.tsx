import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useMemo} from 'react'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import useFilteredItems from '../hooks/useFilteredItems'
import useForm from '../hooks/useForm'
import {MenuProps} from '../hooks/useMenu'
import SearchQueryId from '../shared/gqlIds/SearchQueryId'
import {PALETTE} from '../styles/paletteV2'
import {ICON_SIZE} from '../styles/typographyV2'
import {GitHubScopingSearchFilterMenu_viewer} from '../__generated__/GitHubScopingSearchFilterMenu_viewer.graphql'
import Checkbox from './Checkbox'
import DropdownMenuLabel from './DropdownMenuLabel'
import Icon from './Icon'
import Menu from './Menu'
import MenuItem from './MenuItem'
import MenuItemComponentAvatar from './MenuItemComponentAvatar'
import MenuItemLabel from './MenuItemLabel'
import MockGitHubFieldList from './MockGitHubFieldList'
import TaskFooterIntegrateMenuSearch from './TaskFooterIntegrateMenuSearch'
import TypeAheadLabel from './TypeAheadLabel'

const SearchIcon = styled(Icon)({
  color: PALETTE.TEXT_GRAY,
  fontSize: ICON_SIZE.MD18
})

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

const ProjectAvatar = styled('img')({
  height: 24,
  width: 24,
  marginRight: 8
})

const StyledCheckBox = styled(Checkbox)({
  marginLeft: -8,
  marginRight: 8
})
const StyledMenuItemLabel = styled(MenuItemLabel)({})

const FilterLabel = styled(DropdownMenuLabel)({
  borderBottom: 0
})

interface Props {
  menuProps: MenuProps
  viewer: GitHubScopingSearchFilterMenu_viewer | null
  error: Error | null
}

type GitHubSearchQuery = NonNullable<
  NonNullable<GitHubScopingSearchFilterMenu_viewer['meeting']>['githubSearchQuery']
>

const getValue = (item: {name: string}) => item.name.toLowerCase()

const MAX_PROJECTS = 10

const GitHubScopingSearchFilterMenu = (props: Props) => {
  // TODO replace projects
  const {menuProps, viewer} = props
  const isLoading = viewer === null
  const projects = viewer?.teamMember?.integrations.github?.projects ?? []
  const meeting = viewer?.meeting ?? null
  const meetingId = meeting?.id ?? ''
  const githubSearchQuery = meeting?.githubSearchQuery ?? null
  const nameWithOwnerFilters = githubSearchQuery?.nameWithOwnerFilters ?? []
  const {fields, onChange} = useForm({
    search: {
      getDefault: () => ''
    }
  })
  const {search} = fields
  const {value} = search
  const query = value.toLowerCase()
  const showSearch = projects.length > MAX_PROJECTS
  const queryFilteredProjects = useFilteredItems(query, projects, getValue)
  const selectedAndFilteredProjects = useMemo(() => {
    const selectedProjects = projects.filter((project) => nameWithOwnerFilters.includes(project.id))
    const adjustedMax =
      selectedProjects.length >= MAX_PROJECTS ? selectedProjects.length + 1 : MAX_PROJECTS
    return Array.from(new Set([...selectedProjects, ...queryFilteredProjects])).slice(
      0,
      adjustedMax
    )
  }, [queryFilteredProjects])

  const atmosphere = useAtmosphere()
  const {portalStatus, isDropdown} = menuProps
  const toggleJQL = () => {
    commitLocalUpdate(atmosphere, (store) => {
      const searchQueryId = SearchQueryId.join('github', meetingId)
      const githubSearchQuery = store.get(searchQueryId)
      // this might bork if the checkbox is ticked before the full query loads
      if (!githubSearchQuery) return
      githubSearchQuery.setValue([], 'nameWithOwnerFilters')
    })
  }
  return (
    <Menu
      keepParentFocus
      ariaLabel={'Define the GitHub search query'}
      portalStatus={portalStatus}
      isDropdown={isDropdown}
      resetActiveOnChanges={[selectedAndFilteredProjects]}
    >
      {isLoading && <MockGitHubFieldList />}
      {selectedAndFilteredProjects.length > 0 && <FilterLabel>Filter by project:</FilterLabel>}
      {showSearch && (
        <SearchItem key='search'>
          <StyledMenuItemIcon>
            <SearchIcon>search</SearchIcon>
          </StyledMenuItemIcon>
          <TaskFooterIntegrateMenuSearch
            placeholder={'Search GitHub'}
            value={value}
            onChange={onChange}
          />
        </SearchItem>
      )}
      {(query && selectedAndFilteredProjects.length === 0 && !isLoading && (
        <NoResults key='no-results'>No GitHub Projects found!</NoResults>
      )) ||
        null}
      {selectedAndFilteredProjects.map((project) => {
        const {id: globalProjectKey, avatar, name} = project
        const toggleProjectKeyFilter = () => {
          commitLocalUpdate(atmosphere, (store) => {
            const searchQueryId = SearchQueryId.join('github', meetingId)
            const githubSearchQuery = store.get<GitHubSearchQuery>(searchQueryId)!
            const nameWithOwnerFiltersProxy = githubSearchQuery
              .getValue('nameWithOwnerFilters')!
              .slice()
            const keyIdx = nameWithOwnerFiltersProxy.indexOf(globalProjectKey)
            if (keyIdx !== -1) {
              nameWithOwnerFiltersProxy.splice(keyIdx, 1)
            } else {
              nameWithOwnerFiltersProxy.push(globalProjectKey)
            }
            githubSearchQuery.setValue(nameWithOwnerFiltersProxy, 'nameWithOwnerFilters')
          })
        }
        return (
          <MenuItem
            key={globalProjectKey}
            label={
              <StyledMenuItemLabel>
                <StyledCheckBox active={nameWithOwnerFilters.includes(globalProjectKey)} />
                <ProjectAvatar src={avatar} />
                <TypeAheadLabel query={query} label={name} />
              </StyledMenuItemLabel>
            }
            onClick={toggleProjectKeyFilter}
          />
        )
      })}
    </Menu>
  )
}

export default createFragmentContainer(GitHubScopingSearchFilterMenu, {
  viewer: graphql`
    fragment GitHubScopingSearchFilterMenu_viewer on User {
      meeting(meetingId: $meetingId) {
        id
        ... on PokerMeeting {
          githubSearchQuery {
            nameWithOwnerFilters
          }
        }
      }
      teamMember(teamId: $teamId) {
        integrations {
          github {
            login
          }
        }
      }
    }
  `
})
