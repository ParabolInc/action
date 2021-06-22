import {HttpRequest, HttpResponse} from 'uWebSockets.js'

const uwsGetIP = (res: HttpResponse, req: HttpRequest) => {
  const clientIp = req.getHeader('x-forwarded-for')
  if (clientIp) return clientIp
  // returns ipv6 e.g. '0000:0000:0000:0000:0000:ffff:ac11:0001'
  return Buffer.from(res.getRemoteAddressAsText()).toString()
}

export default uwsGetIP
