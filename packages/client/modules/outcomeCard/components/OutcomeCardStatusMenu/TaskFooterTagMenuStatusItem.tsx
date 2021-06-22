import {TaskFooterTagMenuStatusItem_task} from '../../../../__generated__/TaskFooterTagMenuStatusItem_task.graphql'
import React, {forwardRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import MenuItem from '../../../../components/MenuItem'
import MenuItemDot from '../../../../components/MenuItemDot'
import MenuItemLabel from '../../../../components/MenuItemLabel'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import UpdateTaskMutation from '../../../../mutations/UpdateTaskMutation'
import {AreaEnum, TaskStatusEnum} from '~/__generated__/UpdateTaskMutation.graphql'
import {taskStatusColors, taskStatusLabels} from '../../../../utils/taskStatus'

interface Props {
  area: AreaEnum
  status: TaskStatusEnum
  task: TaskFooterTagMenuStatusItem_task
}

const TaskFooterTagMenuStatusItem = forwardRef((props: Props, ref) => {
  const {area, status, task} = props
  const atmosphere = useAtmosphere()
  const color = taskStatusColors[status]
  const label = taskStatusLabels[status]
  const handleTaskUpdateFactory = () => {
    if (status === task.status) {
      return
    }
    const updatedTask = {
      id: task.id,
      status
    }
    UpdateTaskMutation(atmosphere, {updatedTask, area}, {})
  }
  return (
    <MenuItem
      ref={ref}
      key={status}
      label={
        <MenuItemLabel>
          <MenuItemDot color={color} />
          {`Move to ${label}`}
        </MenuItemLabel>
      }
      onClick={handleTaskUpdateFactory}
    />
  )
})

export default createFragmentContainer(TaskFooterTagMenuStatusItem, {
  task: graphql`
    fragment TaskFooterTagMenuStatusItem_task on Task {
      id
      status
    }
  `
})
