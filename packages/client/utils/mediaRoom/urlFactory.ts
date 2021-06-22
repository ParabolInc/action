interface getSignalingServerUrlSignature {
  roomId: string
  peerId: string
  authToken: string
}

export function getSignalingServerUrl({
  roomId,
  peerId,
  authToken
}: getSignalingServerUrlSignature): string {
  const url = new URL(`wss://${window.location.hostname}`)
  url.port = String(process.env.PROTOO_LISTEN_PORT)
  url.searchParams.append('roomId', roomId)
  url.searchParams.append('peerId', peerId)
  url.searchParams.append('authToken', authToken)
  return url.toString()
}
