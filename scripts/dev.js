// Calling this while the cwd is in dev is MUCH slower than calling it at the root dir.
// Penalty goes away when debugging.
require('./webpack/utils/dotenv')
const path = require('path')
const fs = require('fs')
const {promisify} = require('util')
const webpack = require('webpack')
const getProjectRoot = require('./webpack/utils/getProjectRoot')
const Redis = require('ioredis')
const rmdir = promisify(fs.rmdir)
const unlink = promisify(fs.unlink)
const PROJECT_ROOT = getProjectRoot()
const TOOLBOX_ROOT = path.join(PROJECT_ROOT, 'scripts', 'toolbox')
const pgMigrate = require('node-pg-migrate').default
const cliPgmConfig = require('../packages/server/postgres/pgmConfig')

const compileToolbox = () => {
  return new Promise((resolve) => {
    const config = require('./webpack/toolbox.config')
    const compiler = webpack(config)
    compiler.run(resolve)
  })
}

const schemaPath = path.join(PROJECT_ROOT, 'schema.graphql')

const removeArtifacts = async () => {
  const generated = path.join(PROJECT_ROOT, 'packages/client/__generated__')
  const queryMap = path.join(PROJECT_ROOT, 'queryMap.json')
  try {
    await Promise.all([rmdir(generated, {recursive: true}), unlink(schemaPath), unlink(queryMap)])
  } catch (_) {
    // probably didn't exist, noop
  }
}

const dev = async (maybeInit) => {
  const isInit = !fs.existsSync(path.join(TOOLBOX_ROOT, 'updateSchema.js')) || maybeInit
  const redis = new Redis(process.env.REDIS_URL)
  const toolboxPromise = compileToolbox()
  if (isInit) {
    console.log('👋👋👋      Welcome to Parabol!      👋👋👋')
    await Promise.all([removeArtifacts()])
  }

  const buildDLL = require('./buildDll')()
  const clearRedis = redis.flushall()
  const migrateRethinkDB = require('./migrate')()
  // wait for the rethinkdb migration to happen n case the pg migration depends on it or closes the connection prematurely
  await migrateRethinkDB
  const programmaticPgmConfig = {
    dbClient: cliPgmConfig,
    dir: path.join(PROJECT_ROOT, cliPgmConfig['migrations-dir']),
    direction: 'up',
    migrationsTable: cliPgmConfig['migrations-table']
  }
  const migratePG = pgMigrate(programmaticPgmConfig)
  await toolboxPromise
  await require('./toolbox/updateSchema.js').default()
  if (isInit) {
    // technically, this is unsafe for SSR, but they're so rarely used that's fine
    await require('./compileRelay')()
  }
  // await compileServers()
  await Promise.all([clearRedis, migratePG, buildDLL])
  redis.disconnect()
}

const args = process.argv.slice(2)
const isInit = args.includes('-i')

dev(isInit)
