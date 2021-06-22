import React, {useMemo} from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import TaskColumns from '../../../../components/TaskColumns/TaskColumns'
import {UserColumnsContainer_viewer} from '../../../../__generated__/UserColumnsContainer_viewer.graphql'
import getSafeRegex from '../../../../utils/getSafeRegex'
import toTeamMemberId from '~/utils/relay/toTeamMemberId'
import {useUserTaskFilters} from '~/utils/useUserTaskFilters'

interface Props {
  viewer: UserColumnsContainer_viewer
}

const UserColumnsContainer = (props: Props) => {
  const {viewer} = props
  const {userIds, teamIds} = useUserTaskFilters(viewer.id)
  const {dashSearch, tasks} = viewer
  const filteredTasks = useMemo(() => {
    const dashSearchRegex = getSafeRegex(dashSearch, 'i')
    const nodes = tasks.edges.map(({node}) => node)
    const dashSearchNodes = dashSearch
      ? nodes.filter((task) => {
          return task.contentText && task.contentText.match(dashSearchRegex)
        })
      : nodes

    const teamFilteredNodes = dashSearchNodes.filter((node) =>
      teamIds ? teamIds.includes(node.teamId) : true
    )
    const teamMemberFilteredNodes = teamFilteredNodes.filter((node) =>
      userIds && node.userId ? userIds.includes(node.userId) : true
    )

    return teamMemberFilteredNodes.map((node) => ({
      ...node
    }))
  }, [teamIds, userIds, tasks, dashSearch])
  {
    const {
      viewer: {teams}
    } = props

    // iff 1 user is selected, we show team names at the footer; otherwise we show task owner name
    const areaForTaskCard = userIds && userIds.length === 1 ? 'userDash' : 'teamDash'
    const filteredTeams = userIds
      ? teams.filter(({teamMembers, id: teamId}) => {
          const inTeam = !!teamMembers.find(({userId}) => userIds.includes(userId))
          const teamFiltered = teamIds ? teamIds.includes(teamId) : true
          return teamFiltered && inTeam
        })
      : teamIds
      ? teams.filter(({id}) => teamIds.includes(id))
      : teams

    if (filteredTeams.length) {
      return (
        <TaskColumns
          area={areaForTaskCard}
          tasks={filteredTasks}
          myTeamMemberId={toTeamMemberId(filteredTeams[0].id, userIds ? userIds[0] : viewer.id)}
          teams={filteredTeams}
        />
      )
    } else {
      return null
    }
  }
}

export default createFragmentContainer(UserColumnsContainer, {
  viewer: graphql`
    fragment UserColumnsContainer_viewer on User {
      id
      dashSearch
      teams {
        id
        teamMembers(sortBy: "preferredName") {
          userId
          preferredName
        }
        ...TaskColumns_teams
      }
      tasks(first: 1000, after: $after, userIds: $userIds, teamIds: $teamIds)
        @connection(key: "UserColumnsContainer_tasks", filters: ["userIds", "teamIds"]) {
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
  `
})
