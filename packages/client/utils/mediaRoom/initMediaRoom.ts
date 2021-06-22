import {Dispatch, MutableRefObject, ReducerAction} from 'react'
import clientTempId from '../relay/clientTempId'
import MediaRoom from './MediaRoom'
import reducerMediaRoom from './reducerMediaRoom'

const createRoomId = (teamId: string, meetingId: string): string => `${teamId}:${meetingId}`
const createPeerId = (viewerId: string): string => `${clientTempId()}:${viewerId}`
export const deStructureRoomId = (roomId: string): string[] => roomId.split(':')
export const deStructurePeerId = (peerId: string): string[] => peerId.split(':')

const initMediaRoom = async (
  authToken: string | null,
  teamId: string,
  meetingId: string,
  viewerId: string,
  disposable: MutableRefObject<(() => void) | undefined | null>,
  dispatch: Dispatch<ReducerAction<typeof reducerMediaRoom>>
) => {
  const roomId = createRoomId(teamId, meetingId)
  const peerId = createPeerId(viewerId)
  const mediaRoom = new MediaRoom({roomId, peerId, dispatch, authToken})
  if (disposable.current === null) return
  disposable.current = mediaRoom.close
  return mediaRoom
}

export default initMediaRoom
