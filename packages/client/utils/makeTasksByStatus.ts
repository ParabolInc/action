import {columnArray} from './constants'
import {TaskStatusEnum} from '~/__generated__/UpdateTaskMutation.graphql'

// sorts post-split to be a little more efficient
interface Task {
  status: string
  sortOrder: number
}

export default function makeTasksByStatus<T extends Task>(tasks: readonly T[]) {
  const tasksByStatus = {
    active: [],
    stuck: [],
    done: [],
    future: []
  } as Record<TaskStatusEnum, T[]>
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i]
    tasksByStatus[task.status].push(task)
  }

  // sort after for performance
  for (let i = 0; i < columnArray.length; i++) {
    const status = columnArray[i]
    tasksByStatus[status].sort((a, b) => b.sortOrder - a.sortOrder)
  }
  return tasksByStatus
}
