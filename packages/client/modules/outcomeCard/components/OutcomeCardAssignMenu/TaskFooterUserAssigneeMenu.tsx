import {TaskFooterUserAssigneeMenu_task} from '../../../../__generated__/TaskFooterUserAssigneeMenu_task.graphql'
import {TaskFooterUserAssigneeMenu_viewer} from '../../../../__generated__/TaskFooterUserAssigneeMenu_viewer.graphql'
import React, {useMemo} from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import DropdownMenuLabel from '../../../../components/DropdownMenuLabel'
import Menu from '../../../../components/Menu'
import MenuAvatar from '../../../../components/MenuAvatar'
import MenuItem from '../../../../components/MenuItem'
import MenuItemLabel from '../../../../components/MenuItemLabel'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {MenuProps} from '../../../../hooks/useMenu'
import UpdateTaskMutation from '../../../../mutations/UpdateTaskMutation'
import avatarUser from '../../../../styles/theme/images/avatar-user.svg'
import {AreaEnum} from '~/__generated__/UpdateTaskMutation.graphql'
interface Props {
  area: AreaEnum
  menuProps: MenuProps
  viewer: TaskFooterUserAssigneeMenu_viewer
  task: TaskFooterUserAssigneeMenu_task
}

const TaskFooterUserAssigneeMenu = (props: Props) => {
  const {area, menuProps, task, viewer} = props
  const {userId, id: taskId} = task
  const {team} = viewer
  const atmosphere = useAtmosphere()
  const teamMembers = team?.teamMembers || []
  const taskUserIdx = useMemo(() => teamMembers.findIndex(({userId}) => userId) + 1, [
    userId,
    teamMembers
  ])
  const assignees = useMemo(
    () => teamMembers.filter((teamMember) => teamMember.userId !== userId),
    [userId, teamMembers]
  )
  const handleTaskUpdate = (newAssignee) => () => {
    const newUserId = newAssignee.userId === userId ? null : newAssignee.userId
    UpdateTaskMutation(atmosphere, {updatedTask: {id: taskId, userId: newUserId}, area}, {})
  }

  if (!team) return null
  return (
    <Menu
      ariaLabel={'Assign this task to a teammate'}
      defaultActiveIdx={userId ? taskUserIdx : undefined}
      {...menuProps}
    >
      <DropdownMenuLabel>Assign to:</DropdownMenuLabel>
      {assignees.map((assignee) => {
        return (
          <MenuItem
            key={assignee.id}
            label={
              <MenuItemLabel>
                <MenuAvatar alt={assignee.preferredName} src={assignee.picture || avatarUser} />
                {assignee.preferredName}
              </MenuItemLabel>
            }
            onClick={handleTaskUpdate(assignee)}
          />
        )
      })}
    </Menu>
  )
}

export default createFragmentContainer(TaskFooterUserAssigneeMenu, {
  viewer: graphql`
    fragment TaskFooterUserAssigneeMenu_viewer on User {
      id
      team(teamId: $teamId) {
        teamId: id
        teamMembers(sortBy: "preferredName") {
          id
          picture
          preferredName
          userId
        }
      }
    }
  `,
  task: graphql`
    fragment TaskFooterUserAssigneeMenu_task on Task {
      id
      userId
      team {
        id
      }
    }
  `
})
