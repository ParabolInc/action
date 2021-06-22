import graphql from 'babel-plugin-relay/macro'
import React, {memo} from 'react'
import {createFragmentContainer} from 'react-relay'
import {TaskColumnInner_tasks} from '~/__generated__/TaskColumnInner_tasks.graphql'
import {AreaEnum} from '~/__generated__/UpdateTaskMutation.graphql'
import DraggableTask from '../../../../containers/TaskCard/DraggableTask'

interface Props {
  area: AreaEnum
  tasks: TaskColumnInner_tasks
}

const TaskColumnInner = memo((props: Props) => {
  const {area, tasks} = props
  return tasks.map((task, idx) => (
    <DraggableTask key={task.id} area={area} task={task} idx={idx} />
  )) as any
})

export default createFragmentContainer(TaskColumnInner, {
  tasks: graphql`
    fragment TaskColumnInner_tasks on Task @relay(plural: true) {
      ...DraggableTask_task
      id
    }
  `
})
