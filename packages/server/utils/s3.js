import aws from 'aws-sdk'
import promisify from 'es6-promisify'
import mime from 'mime-types'
import protocolRelativeUrl from './protocolRelativeUrl'

/*
 * Initializing AWS S3 implicitly uses environment variables
 * AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
 */
const s3 = typeof process.env.CDN_BASE_URL === 'string' && process.env.CDN_BASE_URL !== 'key_CDN_BASE_URL' &&
  new aws.S3({
    endpoint: protocolRelativeUrl.parse(process.env.CDN_BASE_URL).hostname,
    s3BucketEndpoint: true,
    signatureVersion: 'v4'
  })

function s3CheckInitialized() {
  if (!s3) {
    throw new Error('S3 uninitialized, did you set process.env.CDN_BASE_URL?')
  }
  return true
}

/*
 * S3 hates leading '/' characters in "Key" parameters for making modification
 * to objects. This function helps us normalize paths without requiring the
 * caller to know about S3's eccentricies.
 */
const keyifyPath = (path) => path.replace(/^\//, '')

export function s3GetObject(url) {
  return s3.getObject({Bucket: process.env.AWS_S3_BUCKET, Key: url}).promise()
}

export function s3PutObject(
  url,
  buffer,
  contentType = null, 
  acl = 'authenticated-read'
) {
  s3CheckInitialized()
  contentType = contentType || mime.lookup(url) || 'application/octet-stream'
  const s3Params = {
    Body: buffer,
    Bucket: process.env.AWS_S3_BUCKET,
    Key: keyifyPath(url),
    ContentType: contentType,
    ACL: acl
  }
  return s3.putObject(s3Params).promise()
}

export function s3DeleteObject(url) {
  s3CheckInitialized()
  const s3Params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: keyifyPath(decodeURI(protocolRelativeUrl.parse(url).pathname))
  }
  return s3.deleteObject(s3Params).promise()
}

export function s3SignUrl(
  operation,
  pathname,
  contentType,
  contentLength = null,
  acl = 'authenticated-read'
) {
  s3CheckInitialized()
  if (operation !== 'getObject' && operation !== 'putObject') {
    throw new Error('S3 operation must be getObject or putObject')
  }
  contentType = contentType || mime.lookup(pathname) || 'application/octet-stream'
  const s3Params = {
    Bucket: process.env.AWS_S3_BUCKET,
    ContentType: contentType,
    Key: keyifyPath(pathname)
  }

  if (operation === 'putObject') {
    s3Params.ACL = acl
  }

  const req = s3.makeRequest(operation, s3Params)
  if (contentLength !== null && typeof contentLength === 'number' && contentLength >= 0) {
    req.on('build', () => {
      // see: https://github.com/aws/aws-sdk-js/issues/502
      req.httpRequest.path += `?Content-Length=${contentLength}`
    })
  }
  return promisify(req.presign, req)(60)
}

export const s3SignGetObject = (pathname, contentType, contentLength, acl) =>
  s3SignUrl('getObject', pathname, contentType, contentLength, acl)

export const s3SignPutObject = (pathname, contentType, contentLength, acl) =>
  s3SignUrl('putObject', pathname, contentType, contentLength, acl)

/*
 * Checks to see if a url points to an asset on S3.
 *
 * Returns Boolean
 */
export function urlIsPossiblyOnS3(url) {
  if (!url) {
    return false
  }
  /*
   * protocolRelativeUrl.parse is guaranteed to return an object with the
   * hostname property.
   */
  const s3host = protocolRelativeUrl.parse(process.env.CDN_BASE_URL).hostname
  const urlHost = protocolRelativeUrl.parse(url).hostname
  return s3host === urlHost
}
