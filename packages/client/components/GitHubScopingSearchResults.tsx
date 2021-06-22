import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {createFragmentContainer} from 'react-relay'
// import useGetUsedServiceTaskIds from '~/hooks/useGetUsedServiceTaskIds'
// import MockScopingList from '~/modules/meeting/components/MockScopingList'
// import useAtmosphere from '../hooks/useAtmosphere'
// import PersistGitHubSearchQueryMutation from '../mutations/PersistGitHubSearchQueryMutation'
import {GitHubScopingSearchResults_meeting} from '../__generated__/GitHubScopingSearchResults_meeting.graphql'
import {GitHubScopingSearchResults_viewer} from '../__generated__/GitHubScopingSearchResults_viewer.graphql'
// import GitHubScopingSearchResultItem from './GitHubScopingSearchResultItem'
// import GitHubScopingSelectAllIssues from './GitHubScopingSelectAllIssues'
// import IntegrationScopingNoResults from './IntegrationScopingNoResults'
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
  // const github = viewer?.teamMember!.integrations.github ?? null
  // const issues = github?.issues ?? null
  // const edges = issues?.edges ?? null
  // const error = issues?.error ?? null
  const [isEditing, setIsEditing] = useState(false)
  // const atmosphere = useAtmosphere()
  // const {id: meetingId, teamId, phases, githubSearchQuery} = meeting
  // const estimatePhase = phases.find(({phaseType}) => phaseType === 'ESTIMATE')
  // const usedServiceTaskIds = useGetUsedServiceTaskIds(estimatePhase)
  const handleAddIssueClick = () => setIsEditing(true)

  // even though it's a little herky jerky, we need to give the user feedback that a search is pending
  // TODO fix flicker after viewer is present but edges isn't set
  // if (!edges) {
  //   return <MockScopingList />
  // }
  // if (edges.length === 0 && !isEditing) {
  //   return (
  //     <>
  //       <IntegrationScopingNoResults error={error?.message} msg={'No issues match that query'} />
  //       <NewIntegrationRecordButton onClick={handleAddIssueClick} labelText={'New Issue'} />
  //     </>
  //   )
  // }

  // const persistQuery = () => {
  //   const {queryString} = githubSearchQuery
  //   // don't persist an empty string (the default)
  //   if (!queryString) return
  //   const nameWithOwnerFilters = githubSearchQuery.nameWithOwnerFilters as string[]
  //   nameWithOwnerFilters.sort()
  //   const lookupKey = JSON.stringify({queryString, nameWithOwnerFilters})
  //   const {githubSearchQueries} = github!
  //   const searchHashes = githubSearchQueries.map(({queryString, nameWithOwnerFilters}) => {
  //     return JSON.stringify({queryString, nameWithOwnerFilters})
  //   })
  //   const isQueryNew = !searchHashes.includes(lookupKey)
  //   if (isQueryNew) {
  //     PersistGitHubSearchQueryMutation(atmosphere, {
  //       teamId,
  //       input: {queryString, nameWithOwnerFilters: nameWithOwnerFilters as string[]}
  //     })
  //   }
  // }
  return (
    <>
      {/* <GitHubScopingSelectAllIssues
        usedServiceTaskIds={usedServiceTaskIds}
        issues={edges}
        meetingId={meetingId}
      /> */}
      <ResultScroller>
        {viewer && (
          <NewGitHubIssueInput
            isEditing={isEditing}
            meeting={meeting}
            setIsEditing={setIsEditing}
            viewer={viewer}
          />
        )}
        {/* {edges.map(({node}) => {
          return (
            <GitHubScopingSearchResultItem
              key={node.id}
              issue={node}
              usedServiceTaskIds={usedServiceTaskIds}
              meetingId={meetingId}
              persistQuery={persistQuery}
            />
          )
        })} */}
      </ResultScroller>
      {!isEditing && (
        <NewIntegrationRecordButton onClick={handleAddIssueClick} labelText={'New Issue'} />
      )}
    </>
  )
}

export default createFragmentContainer(GitHubScopingSearchResults, {
  meeting: graphql`
    fragment GitHubScopingSearchResults_meeting on PokerMeeting {
      ...NewGitHubIssueInput_meeting
      id
      teamId
      githubSearchQuery {
        nameWithOwnerFilters
        queryString
      }
      phases {
        ...useGetUsedServiceTaskIds_phase
        phaseType
      }
    }
  `,
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
              nameWithOwnerFilters
            }
            issues(
              first: $first
              queryString: $queryString
              nameWithOwnerFilters: $nameWithOwnerFilters
            ) @connection(key: "GitHubScopingSearchResults_issues") {
              error {
                message
              }
              edges {
                ...GitHubScopingSelectAllIssues_issues
                node {
                  ...GitHubScopingSearchResultItem_issue
                  id
                }
              }
            }
          }
        }
      }
    }
  `
})
