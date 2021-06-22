import {useEffect, useReducer, useRef} from 'react'
import initMediaRoom from '../utils/mediaRoom/initMediaRoom'
import reducerMediaRoom from '../utils/mediaRoom/reducerMediaRoom'
import {RoomStateEnum} from '../utils/mediaRoom/reducerMediaRoom'
import useAtmosphere from './useAtmosphere'

const initialState = {
  mediaRoom: null,
  room: {
    activeSpeakerId: null,
    state: RoomStateEnum.new
  },
  me: {
    id: null,
    deviceInfo: null
  },
  peers: {},
  producers: {},
  consumers: {}
}

const useMediaRoom = (meetingId: string, teamId: string) => {
  const atmosphere = useAtmosphere()
  const {viewerId, authToken} = atmosphere
  const [state, dispatch] = useReducer(reducerMediaRoom, initialState)
  const disposable = useRef<(() => void) | null>()
  useEffect(() => {
    initMediaRoom(authToken, teamId, meetingId, viewerId, disposable, dispatch)
    return () => {
      disposable.current?.()
      disposable.current = null
    }
  }, [meetingId, teamId, viewerId])
  return state
}

export default useMediaRoom
