import {Threshold} from 'parabol-client/types/constEnums'
import AuthToken from '../database/types/AuthToken'
import ConnectionContext from '../socketHelpers/ConnectionContext'
import encodeAuthToken from '../utils/encodeAuthToken'
import {fromEpochSeconds} from '../utils/epochTime'
import publishInternalGQL from '../utils/publishInternalGQL'

const isTmsValid = (tmsFromDB: string[] = [], tmsFromToken: string[] = []) => {
  if (tmsFromDB.length !== tmsFromToken.length) return false
  for (let i = 0; i < tmsFromDB.length; i++) {
    if (tmsFromDB[i] !== tmsFromToken[i]) return false
  }
  return true
}

// TODO move inside connectSocket
const setFreshTokenIfNeeded = (connectionContext: ConnectionContext, tmsDB: string[]) => {
  const {authToken} = connectionContext
  const {exp, tms} = authToken
  const tokenExpiration = fromEpochSeconds(exp)
  const timeLeftOnToken = tokenExpiration.getTime() - Date.now()
  const tmsIsValid = isTmsValid(tmsDB, tms)
  if (timeLeftOnToken < Threshold.REFRESH_JWT_AFTER || !tmsIsValid) {
    const nextAuthToken = new AuthToken({...authToken, tms: tmsDB})
    connectionContext.authToken = nextAuthToken
    return encodeAuthToken(nextAuthToken)
  }
  return null
}

const query = `
mutation ConnectSocket {
  connectSocket {
    tms
  }
}`

const handleConnect = async (connectionContext: ConnectionContext) => {
  const {authToken, ip, id: socketId} = connectionContext
  const result = await publishInternalGQL({authToken, ip, query, socketId})
  if (!result) return null
  const {data} = result
  const tms = data?.connectSocket?.tms
  if (!tms) return null // should NEVER happen
  const freshToken = setFreshTokenIfNeeded(connectionContext, tms)
  connectionContext.ready()
  return freshToken
}

export default handleConnect
