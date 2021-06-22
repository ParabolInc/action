import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {TaskColumnAddTask_teams} from '~/__generated__/TaskColumnAddTask_teams.graphql'
import AddTaskButton from '../../../../components/AddTaskButton/AddTaskButton'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import CreateTaskMutation from '../../../../mutations/CreateTaskMutation'
import {AreaEnum, TaskStatusEnum} from '~/__generated__/UpdateTaskMutation.graphql'
import dndNoise from '../../../../utils/dndNoise'
import getNextSortOrder from '../../../../utils/getNextSortOrder'
import fromTeamMemberId from '../../../../utils/relay/fromTeamMemberId'
import {taskStatusLabels} from '../../../../utils/taskStatus'
import {TaskColumnAddTask_tasks} from '../../../../__generated__/TaskColumnAddTask_tasks.graphql'
import TaskColumnAddTaskSelectTeam from './TaskColumnAddTaskSelectTeam'

interface Props {
  area: AreaEnum
  isMyMeetingSection?: boolean
  meetingId?: string
  status: TaskStatusEnum
  tasks: TaskColumnAddTask_tasks
  myTeamMemberId?: string
  teamMemberFilterId: string
  teams: TaskColumnAddTask_teams | null
}

const TaskColumnAddTask = (props: Props) => {
  const {
    area,
    isMyMeetingSection,
    status,
    tasks,
    meetingId,
    myTeamMemberId,
    teamMemberFilterId,
    teams
  } = props
  const atmosphere = useAtmosphere()
  const label = taskStatusLabels[status]
  const sortOrder = getNextSortOrder(tasks, dndNoise())
  const {userId, teamId} = fromTeamMemberId(teamMemberFilterId || myTeamMemberId!)
  const {viewerId} = atmosphere
  if (teams) {
    if (teams.length === 1) {
      const {id: teamId} = teams[0]
      const handleAddTask = () =>
        CreateTaskMutation(
          atmosphere,
          {
            newTask: {status, teamId, userId: userId || viewerId, sortOrder, meetingId}
          },
          {}
        )
      return <AddTaskButton onClick={handleAddTask} label={label} />
    }
    return (
      <TaskColumnAddTaskSelectTeam
        sortOrder={sortOrder}
        status={status}
        teams={teams!}
        userId={userId || viewerId}
      />
    )
  } else if (area === 'teamDash' || isMyMeetingSection) {
    const handleAddTask = () =>
      CreateTaskMutation(atmosphere, {newTask: {status, teamId, userId, sortOrder, meetingId}}, {})
    return <AddTaskButton onClick={handleAddTask} label={label} />
  }
  return null
}

export default createFragmentContainer(TaskColumnAddTask, {
  tasks: graphql`
    fragment TaskColumnAddTask_tasks on Task @relay(plural: true) {
      sortOrder
    }
  `,
  teams: graphql`
    fragment TaskColumnAddTask_teams on Team @relay(plural: true) {
      id
      ...TaskColumnAddTaskSelectTeam_teams
    }
  `
})
