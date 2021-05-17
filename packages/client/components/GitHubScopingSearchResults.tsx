import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {createPaginationContainer} from 'react-relay'
import MockScopingList from '~/modules/meeting/components/MockScopingList'
import useAtmosphere from '../hooks/useAtmosphere'
import useGetUsedServiceTaskIds from '../hooks/useGetUsedServiceTaskIds'
import PersistGitHubSearchQueryMutation from '../mutations/PersistGitHubSearchQueryMutation'
import {SprintPokerDefaults} from '../types/constEnums'
import {GQLType} from '../types/generics'
import getNonNullEdges from '../utils/getNonNullEdges'
import {gitHubQueryValidation} from '../validation/gitHubQueryValidation'
import {GitHubScopingSearchResults_meeting} from '../__generated__/GitHubScopingSearchResults_meeting.graphql'
import {GitHubScopingSearchResults_viewer} from '../__generated__/GitHubScopingSearchResults_viewer.graphql'
import GitHubScopingSearchResultItem from './GitHubScopingSearchResultItem'
import GitHubScopingSelectAllIssues from './GitHubScopingSelectAllIssues'
import IntegrationScopingNoResults from './IntegrationScopingNoResults'
import NewGitHubIssueInput from './NewGitHubIssueInput'
import NewIntegrationRecordButton from './NewIntegrationRecordButton'

const ResultScroller = styled('div')({
  overflow: 'auto'
})

interface Props {
  viewer: GitHubScopingSearchResults_viewer | null
  meeting: GitHubScopingSearchResults_meeting
}

const GitHubScopingSearchResults = (props: Props) => {
  const {viewer, meeting} = props
  const github = viewer?.teamMember!.integrations.github ?? null
  const {id: meetingId, githubSearchQuery, teamId, phases} = meeting
  const {queryString} = githubSearchQuery
  const errors = github?.api?.errors ?? null
  const nullableEdges = github?.api?.query?.search?.edges ?? null
  const issues = nullableEdges
    ? getNonNullEdges(nullableEdges)
        .filter((edge) => edge.node.__typename === '_xGitHubIssue')
        .map(({node}) => node as GQLType<typeof node, '_xGitHubIssue'>)
    : null
  // const issueEdges = edges!.filter((edge) => edge.node.__typename === '_xGitHubIssue') as GQLType<typeof edges[0]['node']
  const [isEditing, setIsEditing] = useState(false)
  const atmosphere = useAtmosphere()
  // const {id: meetingId, teamId, phases, githubSearchQuery} = meeting
  const estimatePhase = phases.find(({phaseType}) => phaseType === 'ESTIMATE')
  const usedServiceTaskIds = useGetUsedServiceTaskIds(estimatePhase)
  const handleAddIssueClick = () => setIsEditing(true)

  // even though it's a little herky jerky, we need to give the user feedback that a search is pending
  // TODO fix flicker after viewer is present but edges isn't set
  if (!issues) return <MockScopingList />
  if (issues.length === 0 && !isEditing) {
    const invalidQuery = gitHubQueryValidation(queryString)
    return (
      <>
        <IntegrationScopingNoResults
          error={invalidQuery || errors?.[0]?.message}
          msg={'No issues match that query'}
        />
        <NewIntegrationRecordButton onClick={handleAddIssueClick} labelText={'New Issue'} />
      </>
    )
  }

  const persistQuery = () => {
    // don't persist empty
    if (!queryString) return
    const normalizedQueryString = queryString.toLowerCase().trim()
    // don't persist default
    if (normalizedQueryString === SprintPokerDefaults.GITHUB_DEFAULT_QUERY) return

    const {githubSearchQueries} = github!
    const searchHashes = githubSearchQueries.map(({queryString}) => queryString)
    const isQueryNew = !searchHashes.includes(queryString)
    if (isQueryNew) {
      PersistGitHubSearchQueryMutation(atmosphere, {
        teamId,
        queryString
      })
    }
  }
  return (
    <>
      {
        <GitHubScopingSelectAllIssues
          usedServiceTaskIds={usedServiceTaskIds}
          issues={issues}
          meetingId={meetingId}
        />
      }
      <ResultScroller>
        {viewer && (
          <NewGitHubIssueInput
            isEditing={isEditing}
            meeting={meeting}
            setIsEditing={setIsEditing}
            viewer={viewer}
          />
        )}
        {issues.map((node) => {
          return (
            <GitHubScopingSearchResultItem
              key={node.id}
              issue={node}
              usedServiceTaskIds={usedServiceTaskIds}
              meetingId={meetingId}
              persistQuery={persistQuery}
            />
          )
        })}
      </ResultScroller>
      {!isEditing && (
        <NewIntegrationRecordButton onClick={handleAddIssueClick} labelText={'New Issue'} />
      )}
    </>
  )
}

export default createPaginationContainer(
  GitHubScopingSearchResults,
  {
    viewer: graphql`
      fragment GitHubScopingSearchResults_viewer on User {
        ...NewGitHubIssueInput_viewer
        teamMember(teamId: $teamId) {
          suggestedIntegrations {
            items {
              ... on SuggestedIntegrationGitHub {
                id
                nameWithOwner
              }
            }
          }
          integrations {
            github {
              githubSearchQueries {
                queryString
              }
              api {
                errors {
                  message
                  locations {
                    line
                    column
                  }
                  path
                }
                query {
                  search(first: 10, type: ISSUE, query: $queryString)
                    @connection(key: "GitHubScopingSearchResults_search") {
                    edges {
                      node {
                        __typename
                        ... on _xGitHubIssue {
                          ...GitHubScopingSelectAllIssues_issues
                          ...GitHubScopingSearchResultItem_issue
                          id
                          title
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    meeting: graphql`
      fragment GitHubScopingSearchResults_meeting on PokerMeeting {
        ...NewGitHubIssueInput_meeting
        id
        teamId
        githubSearchQuery {
          queryString
        }
        phases {
          ...useGetUsedServiceTaskIds_phase
          phaseType
        }
      }
    `
  },
  {
    direction: 'forward',
    getConnectionFromProps(props) {
      const {viewer} = props
      return viewer?.teamMember?.integrations.github?.api?.query?.search
    },
    getFragmentVariables(prevVars) {
      return {
        ...prevVars,
        first: 50
      }
    },
    getVariables(_props, {cursor}, fragmentVariables) {
      return {
        ...fragmentVariables,
        first: 50,
        after: cursor
      }
    },
    query: graphql`
      query GitHubScopingSearchResultsPaginationQuery($teamId: String!, $queryString: String!) {
        viewer {
          ...GitHubScopingSearchResults_viewer
        }
      }
    `
  }
)
