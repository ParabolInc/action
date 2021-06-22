import FileStoreManager from './FileStoreManager'
import fs from 'fs'
import path from 'path'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import appOrigin from '../appOrigin'
export default class LocalFileSystemManager extends FileStoreManager {
  protected prependPath(partialPath: string): string {
    return path.join('self-hosted', partialPath)
  }

  protected getPublicFileLocation(fullPath: string): string {
    return encodeURI(makeAppURL(appOrigin, fullPath))
  }

  protected async _putFile(fullPath: string, buffer: Buffer): Promise<void> {
    const fsAbsLocation = path.join(process.cwd(), fullPath)
    await fs.promises.mkdir(path.dirname(fsAbsLocation), {recursive: true})
    await fs.promises.writeFile(fsAbsLocation, buffer)
  }
}
