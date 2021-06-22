import MediaRoom from './MediaRoom'
import {DeviceInfo} from './MediaRoom'
import {types as mediasoupTypes} from 'mediasoup-client'
import LoggerFactory from './Logger'
import {deStructurePeerId} from './initMediaRoom'

let logger
;(async () => {
  logger = await LoggerFactory()
})()

export const getConsumersForPeer = (
  userId: string,
  peers: PeersState,
  consumers: ConsumersState
): ConsumerState[] => {
  const peerIds = Object.keys(peers)
  for (const peerId of peerIds) {
    const [, viewerId] = deStructurePeerId(peerId)
    if (userId === viewerId)
      return peers[peerId].consumers.map((consumerId) => consumers[consumerId])
  }
  return []
}

type MediaRoomAction =
  | InitMediaRoom
  | AddPeer
  | AddProducer
  | AddConsumer
  | RemoveProducer
  | PauseProducer
  | PauseConsumer
  | ResumeProducer
  | ResumeConsumer
  | SetRoomState
  | RemoveConsumer
  | RemovePeer

interface InitMediaRoom {
  type: 'initMediaRoom'
  mediaRoom: MediaRoom
}

export enum RoomStateEnum {
  new = 'new',
  connected = 'connected',
  closed = 'closed'
}

interface SetRoomState {
  type: 'setRoomState'
  state: RoomStateEnum
}

interface AddPeer {
  type: 'addPeer'
  peer: PeerState
}

interface RemovePeer {
  type: 'removePeer'
  peerId: string
}

interface AddConsumer {
  type: 'addConsumer'
  peerId: string
  consumer: ConsumerState
}

interface RemoveConsumer {
  type: 'removeConsumer'
  peerId: string
  consumerId: string
}

interface PauseConsumer {
  type: 'pauseConsumer'
  consumerId: string
  origin: 'local' | 'remote'
}

interface ResumeConsumer {
  type: 'resumeConsumer'
  consumerId: string
  origin: 'local' | 'remote'
}

interface AddProducer {
  type: 'addProducer'
  producer: ProducerState
}

interface RemoveProducer {
  type: 'removeProducer'
  producerId: string
}

interface PauseProducer {
  type: 'pauseProducer'
  producerId: string
}

interface ResumeProducer {
  type: 'resumeProducer'
  producerId: string
}

export interface PeerState {
  id: string
  deviceInfo: DeviceInfo | null
  consumers: string[]
}

export interface PeersState {
  [peerId: string]: PeerState
}

export interface ProducerState {
  id: string
  paused: boolean
  track: MediaStreamTrack
  rtpParameters: mediasoupTypes.RtpParameters
  codec: string
}

export interface ProducersState {
  [producerId: string]: ProducerState
}

export interface ConsumerState {
  id: string
  // type: 'audio' | 'video'
  locallyPaused: boolean
  remotelyPaused: boolean
  rtpParameters: mediasoupTypes.RtpParameters
  priority: number
  codec: string
  track: MediaStreamTrack
  spatialLayers: number
  temporalLayers: number
  preferredSpatialLayer: number
  preferredTemporalLayer: number
}

export interface ConsumersState {
  [consumerId: string]: ConsumerState
}

export interface RoomState {
  state: RoomStateEnum
  activeSpeakerId: string | null
}

export interface MediaRoomState {
  mediaRoom: MediaRoom | null // needed?
  room: RoomState
  me: {
    id: string | null
    deviceInfo: DeviceInfo | null
  }
  peers: PeersState
  producers: ProducersState
  consumers: ConsumersState
}

interface ReducerArgs {
  state: MediaRoomState
  action: MediaRoomAction
}

const initMediaRoomReducer = ({state, action}) => {
  const {mediaRoom} = action
  return Object.assign({}, state, {mediaRoom})
}

const setRoomStateReducer = ({state, action}) => {
  const {state: roomState} = action
  return Object.assign({}, state, {
    room: {...state.room, state: roomState}
  })
}

const addPeerReducer = ({state, action}) => {
  const {peer} = action
  return Object.assign({}, state, {
    peers: {...state.peers, [peer.id]: peer}
  })
}

const removePeerReducer = ({state, action}) => {
  const {peerId} = action
  const newPeers = {...state.peers}
  delete newPeers[peerId]
  const newState = Object.assign({}, state, {peers: newPeers})
  if (peerId && peerId === state.room.activeSpeakerId) newState.room.activeSpeakerId = null
  return newState
}

const addProducerReducer = ({state, action}) => {
  const {producer} = action
  return Object.assign({}, state, {
    producers: {...state.producers, [producer.id]: producer}
  })
}

const removeProducerReducer = ({state, action}) => {
  const {producerId} = action
  const newProducers = {...state.producers}
  delete newProducers[producerId]
  return Object.assign({}, state, {producers: newProducers})
}

const pauseProducerReducer = ({state, action}) => {
  const {producerId} = action
  const producer = state.producers[producerId]
  const newProducer = {...producer, paused: true}
  return {
    ...state,
    producers: {...state.producers, [producerId]: newProducer}
  }
}

const resumeProducerReducer = ({state, action}) => {
  const {producerId} = action
  const producer = state.producers[producerId]
  const newProducer = {...producer, paused: false}
  return Object.assign({}, state, {
    producers: {...state.producers, [producerId]: newProducer}
  })
}

const addConsumerReducer = ({state, action}) => {
  const {consumer, peerId} = action
  const peer = state.peers[peerId]
  if (!peer) {
    logger.debug(peerId, state.peers)
    throw new Error('no peer found for new consumer')
  }
  const newConsumers = [...peer.consumers, consumer.id]
  const newPeer = {...peer, consumers: newConsumers}
  return Object.assign({}, state, {
    consumers: {...state.consumers, [consumer.id]: consumer},
    peers: {...state.peers, [newPeer.id]: newPeer}
  })
}

const removeConsumerReducer = ({state, action}) => {
  const {consumerId, peerId} = action
  const newConsumers = {...state.consumers}
  delete newConsumers[consumerId]
  const newState = Object.assign({}, state, {
    consumers: newConsumers
  })
  const peer = state.peers[peerId]
  if (!peer) return newState
  const idx = peer.consumers.indexOf(consumerId)
  if (idx === -1) throw new Error('Consumer not found')
  const newPeerConsumers = peer.consumers.slice()
  newPeerConsumers.splice(idx, 1)
  const newPeer = {...peer, consumers: newPeerConsumers}
  return Object.assign(newState, {
    peers: {...state.peers, [newPeer.id]: newPeer}
  })
}

const pauseConsumerReducer = ({state, action}) => {
  const {consumerId, origin} = action
  const consumer = state.consumers[consumerId]
  const localPause = origin === 'local'
  const newConsumer = localPause
    ? {...consumer, locallyPaused: true}
    : {...consumer, remotelyPaused: true}
  return Object.assign({}, state, {
    consumers: {...state.consumers, [consumerId]: newConsumer}
  })
}

const resumeConsumerReducer = ({state, action}) => {
  const {consumerId, origin} = action
  const consumer = state.consumers[consumerId]
  const localResume = origin === 'local'
  const newConsumer = localResume
    ? {...consumer, locallyPaused: false}
    : {...consumer, remotelyPaused: false}
  return Object.assign({}, state, {
    consumers: {...state.consumers, [consumerId]: newConsumer}
  })
}

const reducerMediaRoom = (state: MediaRoomState, action: MediaRoomAction) => {
  const reducerHandlers = {
    initMediaRoom: initMediaRoomReducer,
    addPeer: addPeerReducer,
    addProducer: addProducerReducer,
    addConsumer: addConsumerReducer,
    removeProducer: removeProducerReducer,
    pauseProducer: pauseProducerReducer,
    pauseConsumer: pauseConsumerReducer,
    resumeProducer: resumeProducerReducer,
    resumeConsumer: resumeConsumerReducer,
    setRoomState: setRoomStateReducer,
    removeConsumer: removeConsumerReducer,
    removePeer: removePeerReducer
  } as {
    [actionType: string]: (ReducerArgs) => MediaRoomState
  }
  const reducerHandler = reducerHandlers[action.type]
  if (reducerHandler) {
    logger.debug('state before ', action.type, ':', state)
    const reducedState = reducerHandler({state, action})
    logger.debug('state after ', action.type, ':', reducedState)
    return reducedState
  }
  return state
}
export default reducerMediaRoom
