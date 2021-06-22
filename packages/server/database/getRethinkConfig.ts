import flag from 'node-env-flag'
import {parse} from 'url'
import readCert from './readCert'
import dotenv from 'dotenv'
import path from 'path'

export default function getRethinkConfig() {
  const envFile = path.join(__dirname, '../../../', '.env')
  dotenv.config({path: envFile})
  const urlString = process.env.RETHINKDB_URL
  if (!urlString) throw new Error('Invalid RETHINKDB_URL in ENV')
  const u = parse(urlString)
  if (!u.port || !u.path) throw new Error('Invalid RethinkDB URL')
  const config = {
    host: u.hostname || '',
    port: parseInt(u.port, 10),
    authKey: process.env.RETHINKDB_AUTH_KEY || '',
    db: u.path.split('/')[1],
    min: process.env.NODE_ENV === 'production' ? 50 : 3,
    buffer: process.env.NODE_ENV === 'production' ? 50 : 3
  }

  if (process.env.NODE_ENV && flag(process.env.RETHINKDB_SSL)) {
    // we may need a cert for production deployment
    // Compose.io requires this, for example.
    // https://www.compose.io/articles/rethinkdb-and-ssl-think-secure/
    Object.assign(config, {
      ssl: {
        ca: readCert()
      }
    })
  }
  return config
}
