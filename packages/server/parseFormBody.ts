import {HttpResponse, getParts, MultipartField} from 'uWebSockets.js'
import isObject from 'parabol-client/utils/isObject'
import {FetchHTTPData} from 'parabol-client/Atmosphere'
import {Threshold} from '../client/types/constEnums'

interface UploadableBuffer {
  contentType: string
  buffer: Buffer
}

interface UploadableBufferMap {
  [key: string]: UploadableBuffer
}

type ParseFormBodySignature = {
  res: HttpResponse
  contentType: string
}

const isFetchHTTPData = (body: any): body is FetchHTTPData => {
  const validShape = isObject(body)
  const validTypeField = ['start', 'stop'].includes(body['type'])
  const validPayloadField = isObject(body['payload'])
  return validShape && validTypeField && validPayloadField
}

const parseRes = (res: HttpResponse) => {
  return new Promise<Buffer | null>((resolve) => {
    let buffer: Buffer
    res.onData((ab, isLast) => {
      const curBuf = Buffer.from(ab)
      buffer = buffer ? Buffer.concat([buffer, curBuf]) : isLast ? curBuf : Buffer.concat([curBuf])
      // give an extra MB for the rest of the payload
      if (buffer.length > Threshold.MAX_AVATAR_FILE_SIZE * 2) resolve(null)
      if (isLast) resolve(buffer)
    })
  })
}

const parseFormBody = async ({
  res,
  contentType
}: ParseFormBodySignature): Promise<FetchHTTPData | null> => {
  let parsedBody: unknown
  const parsedUploadables: UploadableBufferMap = {}
  const resBuffer = await parseRes(res)
  if (!resBuffer) return null
  const parts = getParts(resBuffer, contentType) as MultipartField[]
  if (!parts) return null

  try {
    parts.forEach(({name, data, type}) => {
      if (name === 'body') {
        parsedBody = JSON.parse(Buffer.from(data).toString())
      } else if (name.startsWith('uploadables')) {
        const [, key] = name.split('.')
        parsedUploadables[key] = {
          contentType: type,
          buffer: Buffer.from(data)
        } as UploadableBuffer
      }
    })
    if (!isFetchHTTPData(parsedBody)) return null
    const validParsedBody = parsedBody as FetchHTTPData
    if (Object.keys(parsedUploadables).length) {
      validParsedBody.payload.variables = {
        ...validParsedBody.payload.variables,
        ...parsedUploadables
      }
    }
    return validParsedBody
  } catch (e) {
    return null
  }
}

export default parseFormBody
