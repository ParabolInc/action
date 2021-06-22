/* DEPRECATED */
import protocolRelativeUrl from './protocolRelativeUrl'
import path from 'path'
import {APP_CDN_USER_ASSET_SUBDIR} from 'parabol-client/utils/constants'

export default function getS3PutUrl(partialPath) {
  const baseUrl = protocolRelativeUrl.parse(process.env.CDN_BASE_URL)
  return path.join(baseUrl.pathname, APP_CDN_USER_ASSET_SUBDIR, partialPath)
}
