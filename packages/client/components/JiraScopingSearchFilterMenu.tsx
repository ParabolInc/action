import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useMemo} from 'react'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import useFilteredItems from '../hooks/useFilteredItems'
import useForm from '../hooks/useForm'
import {MenuProps} from '../hooks/useMenu'
import SearchQueryId from '../shared/gqlIds/SearchQueryId'
import {PALETTE} from '../styles/paletteV3'
import {ICON_SIZE} from '../styles/typographyV2'
import {JiraScopingSearchFilterMenu_viewer} from '../__generated__/JiraScopingSearchFilterMenu_viewer.graphql'
import Checkbox from './Checkbox'
import DropdownMenuLabel from './DropdownMenuLabel'
import Icon from './Icon'
import Menu from './Menu'
import MenuItem from './MenuItem'
import MenuItemComponentAvatar from './MenuItemComponentAvatar'
import MenuItemHR from './MenuItemHR'
import MenuItemLabel from './MenuItemLabel'
import MockJiraFieldList from './MockJiraFieldList'
import TaskFooterIntegrateMenuSearch from './TaskFooterIntegrateMenuSearch'
import TypeAheadLabel from './TypeAheadLabel'

const SearchIcon = styled(Icon)({
  color: PALETTE.SLATE_600,
  fontSize: ICON_SIZE.MD18
})

const NoResults = styled(MenuItemLabel)({
  color: PALETTE.SLATE_600,
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

const UseJQLLabel = styled('span')({
  fontWeight: 600
})

const StyledMenuItemLabel = styled(MenuItemLabel)<{isDisabled: boolean}>(({isDisabled}) => ({
  opacity: isDisabled ? 0.5 : undefined
}))

const FilterLabel = styled(DropdownMenuLabel)({
  borderBottom: 0
})

interface Props {
  menuProps: MenuProps
  viewer: JiraScopingSearchFilterMenu_viewer | null
  error: Error | null
}

type JiraSearchQuery = NonNullable<
  NonNullable<JiraScopingSearchFilterMenu_viewer['meeting']>['jiraSearchQuery']
>

const getValue = (item: {name: string}) => item.name.toLowerCase()

const MAX_PROJECTS = 10

const JiraScopingSearchFilterMenu = (props: Props) => {
  const {menuProps, viewer} = props
  const isLoading = viewer === null
  const projects = viewer?.teamMember?.integrations.atlassian?.projects ?? []
  const meeting = viewer?.meeting ?? null
  const meetingId = meeting?.id ?? ''
  const jiraSearchQuery = meeting?.jiraSearchQuery ?? null
  const projectKeyFilters = jiraSearchQuery?.projectKeyFilters ?? []
  const isJQL = jiraSearchQuery?.isJQL ?? false
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
    const selectedProjects = projects.filter((project) => projectKeyFilters.includes(project.id))
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
      const searchQueryId = SearchQueryId.join('jira', meetingId)
      const jiraSearchQuery = store.get(searchQueryId)
      // this might bork if the checkbox is ticked before the full query loads
      if (!jiraSearchQuery) return
      jiraSearchQuery.setValue(!isJQL, 'isJQL')
      jiraSearchQuery.setValue([], 'projectKeyFilters')
    })
  }
  return (
    <Menu
      keepParentFocus
      ariaLabel={'Define the Jira search query'}
      portalStatus={portalStatus}
      isDropdown={isDropdown}
      resetActiveOnChanges={[selectedAndFilteredProjects]}
    >
      <MenuItem
        key={'isJQL'}
        label={
          <MenuItemLabel>
            <StyledCheckBox active={isJQL} />
            <UseJQLLabel>{'Use JQL'}</UseJQLLabel>
          </MenuItemLabel>
        }
        onClick={toggleJQL}
      />
      <MenuItemHR />
      {isLoading && <MockJiraFieldList />}
      {selectedAndFilteredProjects.length > 0 && <FilterLabel>Filter by project:</FilterLabel>}
      {showSearch && (
        <SearchItem key='search'>
          <StyledMenuItemIcon>
            <SearchIcon>search</SearchIcon>
          </StyledMenuItemIcon>
          <TaskFooterIntegrateMenuSearch
            placeholder={'Search Jira'}
            value={value}
            onChange={onChange}
          />
        </SearchItem>
      )}
      {(query && selectedAndFilteredProjects.length === 0 && !isLoading && (
        <NoResults key='no-results'>No Jira Projects found!</NoResults>
      )) ||
        null}
      {selectedAndFilteredProjects.map((project) => {
        const {id: globalProjectKey, avatar, name} = project
        const toggleProjectKeyFilter = () => {
          commitLocalUpdate(atmosphere, (store) => {
            const searchQueryId = SearchQueryId.join('jira', meetingId)
            const jiraSearchQuery = store.get<JiraSearchQuery>(searchQueryId)!
            const projectKeyFiltersProxy = jiraSearchQuery.getValue('projectKeyFilters')!.slice()
            const keyIdx = projectKeyFiltersProxy.indexOf(globalProjectKey)
            if (keyIdx !== -1) {
              projectKeyFiltersProxy.splice(keyIdx, 1)
            } else {
              projectKeyFiltersProxy.push(globalProjectKey)
            }
            jiraSearchQuery.setValue(projectKeyFiltersProxy, 'projectKeyFilters')
          })
        }
        return (
          <MenuItem
            key={globalProjectKey}
            label={
              <StyledMenuItemLabel isDisabled={isJQL}>
                <StyledCheckBox
                  active={projectKeyFilters.includes(globalProjectKey)}
                  disabled={isJQL}
                />
                <ProjectAvatar src={avatar} />
                <TypeAheadLabel query={query} label={name} />
              </StyledMenuItemLabel>
            }
            onClick={toggleProjectKeyFilter}
            isDisabled={isJQL}
          />
        )
      })}
    </Menu>
  )
}

export default createFragmentContainer(JiraScopingSearchFilterMenu, {
  viewer: graphql`
    fragment JiraScopingSearchFilterMenu_viewer on User {
      meeting(meetingId: $meetingId) {
        id
        ... on PokerMeeting {
          jiraSearchQuery {
            projectKeyFilters
            isJQL
          }
        }
      }
      teamMember(teamId: $teamId) {
        integrations {
          atlassian {
            projects {
              id
              name
              avatar
            }
          }
        }
      }
    }
  `
})
