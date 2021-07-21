import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import sleep from '../client/utils/sleep'
import uWSAsyncHandler from './graphql/uWSAsyncHandler'
import {NO_IMAGE_BUFFER} from './utils/atlassian/jiraImages'
import getRedis from './utils/getRedis'

const getImageFromCache = async (fileName: string, tryAgain: boolean) => {
  const redis = getRedis()
  const imageBuffer = await redis.getBuffer(fileName)
  if (imageBuffer === null || imageBuffer.length === 0) return NO_IMAGE_BUFFER
  if (imageBuffer.length > 1) return imageBuffer
  if (tryAgain) {
    await sleep(500)
    return getImageFromCache(fileName, false)
  }
  return NO_IMAGE_BUFFER
}

const jiraImagesHandler = uWSAsyncHandler(async (res: HttpResponse, req: HttpRequest) => {
  const fileName = req.getParameter(0)
  const imageBuffer = await getImageFromCache(fileName, true)
  res.cork(() => {
    res
      .writeStatus('200')
      .writeHeader('Content-Type', 'image/png')
      .end(imageBuffer)
  })
})

export default jiraImagesHandler
