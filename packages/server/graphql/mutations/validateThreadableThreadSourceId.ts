import {ThreadSourceEnum} from '../../database/types/ThreadSource'
import {DataLoaderWorker} from '../graphql'

const validateThreadableThreadSourceId = async (
  threadSource: ThreadSourceEnum | null,
  threadId: string | null | undefined,
  meetingId: string | null | undefined,
  dataLoader: DataLoaderWorker
) => {
  if (threadId && threadSource && threadSource !== 'STORY') {
    const thread = await dataLoader
      .get('threadSources')
      .load({sourceId: threadId, type: threadSource})
    if (!thread || thread.meetingId !== meetingId) {
      return 'Invalid thread source ID'
    }
  }
  return undefined
}

export default validateThreadableThreadSourceId
