/* DEPRECATED */
import { s3SignPutObject } from './s3'
import getS3PutUrl from './getS3PutUrl'

export default function getS3SignedPutUrl(contentType, contentLength, partialPath) {
  const pathname = getS3PutUrl(partialPath)
  return s3SignPutObject(pathname, contentType, contentLength, 'public-read')
}
