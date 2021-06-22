import crypto from 'crypto'
import stringify from 'fast-json-stable-stringify'

const getHashAndJSON = (obj: any) => {
  const str = stringify(obj)
  const checksum = crypto.createHash('md5')
  checksum.update(str)
  const id = checksum.digest('base64')
  return {id, str}
}

export default getHashAndJSON
