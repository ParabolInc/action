import Atmosphere from '../../Atmosphere'
import removeAllRangesForEntity from './removeAllRangesForEntity'
import UpdateTaskMutation from '../../mutations/UpdateTaskMutation'
import {AreaEnum} from '~/__generated__/UpdateTaskMutation.graphql'

const removeContentTag = (
  tagValue: string,
  atmosphere: Atmosphere,
  taskId: string,
  content: string,
  area: AreaEnum
) => {
  const eqFn = (data) => data.value === tagValue
  const nextContent = removeAllRangesForEntity(content, 'TAG', eqFn)
  if (!nextContent) return
  const updatedTask = {
    id: taskId,
    content: nextContent
  }
  UpdateTaskMutation(atmosphere, {updatedTask, area}, {})
}

export default removeContentTag
