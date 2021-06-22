import getPubSub from '../../utils/getPubSub'
import {UWebSocket} from './handleSignal'

const closeWRTC = (ws: UWebSocket) => {
  if (!ws.context) return
  const {userId, roomId, iterators} = ws.context
  iterators.forEach((iterator) => iterator.return())
  // i wonder if setting length = 0 is a cause of the V8 mem leak?
  ws.context.iterators = []
  if (userId) {
    getPubSub().publish(`signal/room/${roomId}`, {type: 'leaveSwarm', userId})
  }
  delete (ws as any).context
}

export default closeWRTC
