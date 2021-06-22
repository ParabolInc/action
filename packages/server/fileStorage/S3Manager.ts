import FileStoreManager from './FileStoreManager'
import {s3PutObject} from '../utils/s3'
import protocolRelativeUrl from '../utils/protocolRelativeUrl'
import path from 'path'
import {APP_CDN_USER_ASSET_SUBDIR} from 'parabol-client/utils/constants'

export default class S3Manager extends FileStoreManager {
  protected prependPath(partialPath: string): string {
    const baseUrl = protocolRelativeUrl.parse(process.env.CDN_BASE_URL)
    return path.join(baseUrl.pathname, APP_CDN_USER_ASSET_SUBDIR, partialPath)
  }

  protected getPublicFileLocation(fullPath: string): string {
    const bucket = process.env.AWS_S3_BUCKET
    if (!bucket) throw new Error('`AWS_S3_BUCKET` env var is not configured')
    return encodeURI(`https://${bucket}${fullPath}`)
  }

  protected async _putFile(fullPath: string, buffer: Buffer): Promise<void> {
    await s3PutObject(fullPath, buffer)
  }
}
