import {Pool} from 'pg'
import getPgConfig from './getPgConfig'

const config = getPgConfig()

let pool: Pool
const getPg = () => {
  if (!pool) {
    pool = new Pool(config)
  }
  return pool
}

export default getPg
