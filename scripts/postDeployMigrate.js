require('dotenv').config()
const pgmPostDeployConfig = require('../packages/server/postgres/pgmPostDeployConfig')
const path = require('path')
const getProjectRoot = require('./webpack/utils/getProjectRoot')
const PROJECT_ROOT = getProjectRoot()
const pgMigrate = require('node-pg-migrate').default
require('rethinkdb-ts-migrate') // hack to be able to use files for migration files
const getRethink = require('../packages/server/database/rethinkDriver').default

const postDeployMigrate = async () => {
  const programmaticConfig = {
    dbClient: pgmPostDeployConfig,
    dir: path.join(PROJECT_ROOT, pgmPostDeployConfig['migrations-dir']),
    direction: 'up',
    migrationsTable: pgmPostDeployConfig['migrations-table']
  }
  await Promise.all([pgMigrate(programmaticConfig)])
  r = await getRethink()
  await r.getPoolMaster().drain()
}

postDeployMigrate()
