import {ThreadSourceEnum} from '../../database/types/ThreadSource'

const getThreadSourceType = (threadSource): ThreadSourceEnum => {
  if (threadSource.reflections) return 'REFLECTION_GROUP'
  else if (threadSource.content) return 'AGENDA_ITEM'
  return 'STORY'
}

export default getThreadSourceType
