import {HttpResponse} from 'uWebSockets.js'

type Json = null | boolean | number | string | Json[] | {[key: string]: Json}
const defaultParser = <T>(buffer: Buffer): T => JSON.parse(buffer.toString())

const parseBody = <T = Json>({
  res,
  parser = defaultParser
}: {
  res: HttpResponse
  parser?: (buffer: Buffer) => T
}) => {
  return new Promise<T | null>((resolve) => {
    let buffer: Buffer
    res.onData((ab, isLast) => {
      const curBuf = Buffer.from(ab)
      buffer = buffer ? Buffer.concat([buffer, curBuf]) : isLast ? curBuf : Buffer.concat([curBuf])
      if (isLast) {
        try {
          resolve(parser(buffer))
        } catch (e) {
          resolve(null)
        }
      }
    })
  })
}

export default parseBody
