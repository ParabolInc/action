import fs from 'fs'
import path from 'path'
import getRethink from '../../packages/server/database/rethinkDriver'
import getProjectRoot from '../webpack/utils/getProjectRoot'
import getRedis from '../../packages/server/utils/getRedis'
import sendToSentry from '../../packages/server/utils/sendToSentry'

const PROJECT_ROOT = getProjectRoot()

const flushSocketConnections = async () => {
  const redis = getRedis()
  const userPresenceStream = redis.scanStream({match: 'presence:*'})
  userPresenceStream.on('data', (keys) => {
    if (!keys?.length) return
    const writes = keys.map((key) => {
      return ['del', key]
    })
    redis.multi(writes).exec()
  })
  await new Promise((resolve, reject) => {
    userPresenceStream.on('end', resolve)
    userPresenceStream.on('error', (e) => {
      sendToSentry(e)
      reject(e)
    })
  })

  const onlineTeamsStream = redis.scanStream({match: 'team:*'})
  onlineTeamsStream.on('data', (keys) => {
    if (!keys?.length) return
    const writes = keys.map((key) => {
      return ['del', key]
    })
    redis.multi(writes).exec()
  })
  await new Promise((resolve, reject) => {
    onlineTeamsStream.on('end', () => {
      resolve()
    })
    onlineTeamsStream.on('error', (e) => {
      sendToSentry(e)
      reject(e)
    })
  })
}

const storePersistedQueries = async () => {
  const queryMap = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'queryMap.json')).toString())
  const hashes = Object.keys(queryMap)
  const now = new Date()
  const records = hashes.map((hash) => ({
    id: hash,
    query: queryMap[hash],
    createdAt: now
  }))

  const r = await getRethink()
  const res = await r
    .table('QueryMap')
    .insert(records, {conflict: 'replace'})
    .run()
  console.log(`Added ${res.inserted} records to the queryMap`)
}

const postDeploy = async () => {
  try {
    const r = await getRethink()
    await flushSocketConnections()
    await storePersistedQueries()
    await r.getPoolMaster().drain()
  } catch (e) {
    console.log('Post deploy error', e)
  }

  process.exit()
}

postDeploy()
