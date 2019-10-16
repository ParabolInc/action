import React from 'react'
import AddTaskButton from '../../../../components/AddTaskButton/AddTaskButton'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import CreateTaskMutation from '../../../../mutations/CreateTaskMutation'
import {ITeam, TaskStatusEnum} from '../../../../types/graphql'
import lazyPreload from '../../../../utils/lazyPreload'
import {taskStatusLabels} from '../../../../utils/taskStatus'

interface Props {
  status: TaskStatusEnum
  sortOrder: number
  teams: readonly Pick<ITeam, 'id' | 'name'>[]
}

const SelectTeamDropdown = lazyPreload(() =>
  import(
    /* webpackChunkName: 'SelectTeamDropdown' */
    '../../../../components/SelectTeamDropdown'
  )
)

const TaskColumnAddTaskSelectTeam = (props: Props) => {
  const {sortOrder, status, teams} = props
  const label = taskStatusLabels[status]
  const atmosphere = useAtmosphere()
  const {menuProps, originRef, menuPortal, togglePortal} = useMenu(MenuPosition.UPPER_LEFT)
  const teamHandleClick = (teamId) => () => {
    CreateTaskMutation(atmosphere, {
      newTask: {
        sortOrder,
        status,
        teamId,
        userId: atmosphere.viewerId
      }
    })
  }
  return (
    <>
      <AddTaskButton
        ref={originRef}
        onClick={togglePortal}
        onMouseEnter={SelectTeamDropdown.preload}
        label={label}
      />
      {menuPortal(
        <SelectTeamDropdown menuProps={menuProps} teamHandleClick={teamHandleClick} teams={teams} />
      )}
    </>
  )
}

export default TaskColumnAddTaskSelectTeam
