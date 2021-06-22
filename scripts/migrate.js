require('./webpack/utils/dotenv')
const path = require('path')
const migrate = require('rethinkdb-ts-migrate')
const {parse} = require('url')
const getProjectRoot = require('./webpack/utils/getProjectRoot')

const startMigration = async (direction = 'up') => {

  // migrating up goes all the way, migrating down goes down by 1
  const all = direction === 'up'
  if (process.env.NODE_ENV === 'test') {
    console.log('NODE_ENV is test, loading .env.test...')
  }
  const PROJECT_ROOT = getProjectRoot()
  const DB_ROOT = path.join(PROJECT_ROOT, 'packages/server/database')
  const {hostname, port, path: urlPath} = parse(process.env.RETHINKDB_URL)
  process.env.host = hostname
  process.env.port = port
  process.env.db = urlPath.slice(1)
  process.env.r = process.cwd()
  try {
    await migrate[direction]({all, root: DB_ROOT})
  } catch (e) {
    console.error('Migration error', e)
  }
}

if (require.main === module) {
  const [, , direction = 'up'] = process.argv
  const dir = direction === 'up' || direction === 'down' ? direction : undefined
  startMigration(dir)
}

module.exports = startMigration
