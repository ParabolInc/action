import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import useGetUsedServiceTaskIds from '~/hooks/useGetUsedServiceTaskIds'
import MockScopingList from '~/modules/meeting/components/MockScopingList'
import useAtmosphere from '../hooks/useAtmosphere'
import PersistJiraSearchQueryMutation from '../mutations/PersistJiraSearchQueryMutation'
import {JiraScopingSearchResults_meeting} from '../__generated__/JiraScopingSearchResults_meeting.graphql'
import {JiraScopingSearchResults_viewer} from '../__generated__/JiraScopingSearchResults_viewer.graphql'
import IntegrationScopingNoResults from './IntegrationScopingNoResults'
import JiraScopingSearchResultItem from './JiraScopingSearchResultItem'
import JiraScopingSelectAllIssues from './JiraScopingSelectAllIssues'
import NewIntegrationRecordButton from './NewIntegrationRecordButton'
import NewJiraIssueInput from './NewJiraIssueInput'

const ResultScroller = styled('div')({
  overflow: 'auto'
})

interface Props {
  viewer: JiraScopingSearchResults_viewer | null
  meeting: JiraScopingSearchResults_meeting
}

const JiraScopingSearchResults = (props: Props) => {
  const {viewer, meeting} = props
  const atlassian = viewer?.teamMember!.integrations.atlassian ?? null
  const issues = atlassian?.issues ?? null
  const edges = issues?.edges ?? null
  const error = issues?.error ?? null
  const [isEditing, setIsEditing] = useState(false)
  const atmosphere = useAtmosphere()
  const {id: meetingId, teamId, phases, jiraSearchQuery} = meeting
  const estimatePhase = phases.find(({phaseType}) => phaseType === 'ESTIMATE')
  const usedServiceTaskIds = useGetUsedServiceTaskIds(estimatePhase)
  const handleAddIssueClick = () => setIsEditing(true)

  // even though it's a little herky jerky, we need to give the user feedback that a search is pending
  // TODO fix flicker after viewer is present but edges isn't set
  if (!edges) {
    return <MockScopingList />
  }
  if (edges.length === 0 && !isEditing) {
    return (
      <>
        <IntegrationScopingNoResults error={error?.message} msg={'No issues match that query'} />
        <NewIntegrationRecordButton onClick={handleAddIssueClick} labelText={'New Issue'} />
      </>
    )
  }

  const persistQuery = () => {
    const {queryString, isJQL} = jiraSearchQuery
    // don't persist an empty string (the default)
    if (!queryString) return
    const projectKeyFilters = jiraSearchQuery.projectKeyFilters as string[]
    projectKeyFilters.sort()
    const lookupKey = JSON.stringify({queryString, projectKeyFilters})
    const {jiraSearchQueries} = atlassian!
    const searchHashes = jiraSearchQueries.map(({queryString, projectKeyFilters}) => {
      return JSON.stringify({queryString, projectKeyFilters})
    })
    const isQueryNew = !searchHashes.includes(lookupKey)
    if (isQueryNew) {
      PersistJiraSearchQueryMutation(atmosphere, {
        teamId,
        input: {queryString, isJQL, projectKeyFilters: projectKeyFilters as string[]}
      })
    }
  }
  return (
    <>
      <JiraScopingSelectAllIssues
        usedServiceTaskIds={usedServiceTaskIds}
        issues={edges}
        meetingId={meetingId}
      />
      <ResultScroller>
        {viewer && (
          <NewJiraIssueInput
            isEditing={isEditing}
            meeting={meeting}
            setIsEditing={setIsEditing}
            viewer={viewer}
          />
        )}
        {edges.map(({node}) => {
          return (
            <JiraScopingSearchResultItem
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

export default createFragmentContainer(JiraScopingSearchResults, {
  meeting: graphql`
    fragment JiraScopingSearchResults_meeting on PokerMeeting {
      ...NewJiraIssueInput_meeting
      id
      teamId
      jiraSearchQuery {
        isJQL
        projectKeyFilters
        queryString
      }
      phases {
        ...useGetUsedServiceTaskIds_phase
        phaseType
      }
    }
  `,
  viewer: graphql`
    fragment JiraScopingSearchResults_viewer on User {
      ...NewJiraIssueInput_viewer
      teamMember(teamId: $teamId) {
        integrations {
          atlassian {
            jiraSearchQueries {
              isJQL
              queryString
              projectKeyFilters
            }
            issues(
              first: $first
              queryString: $queryString
              isJQL: $isJQL
              projectKeyFilters: $projectKeyFilters
            ) @connection(key: "JiraScopingSearchResults_issues") {
              error {
                message
              }
              edges {
                ...JiraScopingSelectAllIssues_issues
                node {
                  ...JiraScopingSearchResultItem_issue
                  id
                  summary
                }
              }
            }
          }
        }
      }
    }
  `
})
