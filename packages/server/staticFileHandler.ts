import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import acceptsBrotli from './acceptsBrotli'
import serveStatic from './utils/serveStatic'

const ROUTE = '/static/'
const staticFileHandler = async (res: HttpResponse, req: HttpRequest) => {
  const fileName = req.getUrl().slice(ROUTE.length)
  const servedStatic = serveStatic(res, fileName, acceptsBrotli(req))
  if (servedStatic) return
  res.writeStatus('404').end()
  return
}

export default staticFileHandler
