import {TaskFooterTeamAssigneeMenu_task} from '../../../../__generated__/TaskFooterTeamAssigneeMenu_task.graphql'
import {TaskFooterTeamAssigneeMenu_viewer} from '../../../../__generated__/TaskFooterTeamAssigneeMenu_viewer.graphql'
import React, {useMemo} from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import DropdownMenuLabel from '../../../../components/DropdownMenuLabel'
import Menu from '../../../../components/Menu'
import MenuItem from '../../../../components/MenuItem'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {MenuProps} from '../../../../hooks/useMenu'
import ChangeTaskTeamMutation from '../../../../mutations/ChangeTaskTeamMutation'
import useMutationProps from '../../../../hooks/useMutationProps'
import {useUserTaskFilters} from '~/utils/useUserTaskFilters'

interface Props {
  menuProps: MenuProps
  viewer: TaskFooterTeamAssigneeMenu_viewer
  task: TaskFooterTeamAssigneeMenu_task
}

const TaskFooterTeamAssigneeMenu = (props: Props) => {
  const {menuProps, task, viewer} = props
  const {userIds, teamIds} = useUserTaskFilters(viewer.id)
  const {team, id: taskId} = task
  const {id: teamId} = team
  const {teams} = viewer
  const assignableTeams = useMemo(() => {
    const filteredTeams = userIds
      ? teams.filter(({teamMembers}) => !!teamMembers.find(({userId}) => userIds.includes(userId)))
      : teamIds
      ? teams.filter(({id}) => teamIds.includes(id))
      : teams
    return filteredTeams
  }, [teamIds, userIds])
  const taskTeamIdx = useMemo(() => assignableTeams.map(({id}) => id).indexOf(teamId) + 1, [
    teamId,
    assignableTeams
  ])

  const atmosphere = useAtmosphere()
  const {submitting, submitMutation, onError, onCompleted} = useMutationProps()
  const handleTaskUpdate = (newTeam) => () => {
    if (!submitting && teamId !== newTeam.id) {
      submitMutation()
      ChangeTaskTeamMutation(atmosphere, {taskId, teamId: newTeam.id}, {onError, onCompleted})
    }
  }

  return (
    <Menu
      {...menuProps}
      defaultActiveIdx={taskTeamIdx}
      ariaLabel={'Assign this task to another team'}
    >
      <DropdownMenuLabel>Move to:</DropdownMenuLabel>
      {assignableTeams.map((team) => {
        return <MenuItem key={team.id} label={team.name} onClick={handleTaskUpdate(team)} />
      })}
    </Menu>
  )
}

export default createFragmentContainer(TaskFooterTeamAssigneeMenu, {
  viewer: graphql`
    fragment TaskFooterTeamAssigneeMenu_viewer on User {
      id
      teams {
        id
        name
        teamMembers(sortBy: "preferredName") {
          userId
          preferredName
        }
      }
    }
  `,
  task: graphql`
    fragment TaskFooterTeamAssigneeMenu_task on Task {
      id
      team {
        id
      }
    }
  `
})
