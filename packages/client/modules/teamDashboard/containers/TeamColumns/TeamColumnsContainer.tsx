import {TeamColumnsContainer_viewer} from '../../../../__generated__/TeamColumnsContainer_viewer.graphql'
import React, {useMemo} from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import TaskColumns from '../../../../components/TaskColumns/TaskColumns'
import toTeamMemberId from '../../../../utils/relay/toTeamMemberId'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import getSafeRegex from '~/utils/getSafeRegex'

interface Props {
  viewer: TeamColumnsContainer_viewer
}

const TeamColumnsContainer = (props: Props) => {
  const {viewer} = props
  const {dashSearch, team} = viewer
  const {id: teamId, tasks, teamMembers, teamMemberFilter} = team!
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const teamMemberFilterId = (teamMemberFilter && teamMemberFilter.id) || null
  const teamMemberFilteredTasks = useMemo(() => {
    const nodes = tasks.edges.map(({node}) => ({
      ...node,
      teamMembers
    }))
    return teamMemberFilterId
      ? nodes.filter((node) => {
          return node.userId && toTeamMemberId(node.teamId, node.userId) === teamMemberFilterId
        })
      : nodes
  }, [tasks.edges, teamMemberFilterId, teamMembers])

  const filteredTasks = useMemo(() => {
    if (!dashSearch) return teamMemberFilteredTasks
    const dashSearchRegex = getSafeRegex(dashSearch, 'i')
    return teamMemberFilteredTasks.filter((task) => task.contentText?.match(dashSearchRegex))
  }, [dashSearch, teamMemberFilteredTasks])
  return (
    <TaskColumns
      myTeamMemberId={toTeamMemberId(teamId, viewerId)}
      tasks={filteredTasks}
      teamMemberFilterId={teamMemberFilterId}
      area='teamDash'
      teams={null}
    />
  )
}

export default createFragmentContainer(TeamColumnsContainer, {
  viewer: graphql`
    fragment TeamColumnsContainer_viewer on User {
      dashSearch
      team(teamId: $teamId) {
        id
        teamMemberFilter {
          id
        }
        teamMembers(sortBy: "preferredName") {
          id
          picture
          preferredName
        }
        tasks(first: 1000) @connection(key: "TeamColumnsContainer_tasks") {
          edges {
            node {
              ...TaskColumns_tasks
              # grab these so we can sort correctly
              id
              content @__clientField(handle: "contentText")
              contentText
              status
              sortOrder
              teamId
              userId
            }
          }
        }
      }
    }
  `
})
