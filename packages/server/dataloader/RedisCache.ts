import Redis from 'ioredis'
import ms from 'ms'
import {Unpromise} from 'parabol-client/types/generics'
import {DBType} from '../database/rethinkDriver'
import customRedisQueries from './customRedisQueries'
import hydrateRedisDoc from './hydrateRedisDoc'
import RethinkDBCache, {RWrite} from './RethinkDBCache'

export type RedisType = {
  [P in keyof typeof customRedisQueries]: Unpromise<ReturnType<typeof customRedisQueries[P]>>[0]
}

export type CacheType = RedisType & DBType

const TTL = ms('3h')

const msetpx = (key: string, value: Record<string, unknown>) => {
  return ['set', key, JSON.stringify(value), 'PX', TTL] as string[]
}
// type ClearLocal = (key: string) => void

export default class RedisCache<T extends keyof CacheType> {
  rethinkDBCache = new RethinkDBCache()
  redis?: Redis.Redis
  // remote invalidation is stuck on upgrading to Redis v6 in prod
  // invalidator = new Redis(process.env.REDIS_URL)
  cachedTypes = new Set<string>()
  invalidatorClientId!: string
  // constructor(clearLocal: ClearLocal) {
  //   this.initializeInvalidator(clearLocal)
  // }
  // private async initializeInvalidator(clearLocal: ClearLocal) {
  //   this.invalidator.subscribe('__redis__:invalidate')
  //   this.invalidator.on('message', (_channel, key) => {
  //     clearLocal(key)
  //   })
  //   this.invalidatorClientId = await this.getRedis().client('id')
  // }
  // private trackInvalidations(fetches: {table: T}[]) {
  //   // This O(N) operation could be O(1), but that requires updating the prefixes as we cache more things
  //   // the risk of an invalid cache hit isn't worth it
  //   for (let i = 0; i < fetches.length; i++) {
  //     const {table} = fetches[i]
  //     if (!this.cachedTypes.has(table)) {
  //       this.cachedTypes.add(table)
  //       // whenever any key starts with the ${table} prefix gets set, send an invalidation message to the invalidator
  //       // noloop is used to exclude sending the message to the client that called set
  //       this.getRedis().client('TRACKING', 'ON', 'REDIRECT', this.invalidatorClientId, 'BCAST', 'NOLOOP', 'PREFIX', table)
  //     }
  //   }
  // }
  private getRedis() {
    if (!this.redis) {
      this.redis = new Redis(process.env.REDIS_URL)
    }
    return this.redis
  }
  read = async (fetches: {table: T; id: string}[]) => {
    // this.trackInvalidations(fetches)
    const fetchKeys = fetches.map(({table, id}) => `${table}:${id}`)
    const cachedDocs = await this.getRedis().mget(...fetchKeys)
    const missingKeysForRethinkDB = [] as {table: T; id: string}[]
    const customQueriesByType = {} as {[type: string]: string[]}
    const customQueries = [] as Promise<any[]>[]

    for (let i = 0; i < cachedDocs.length; i++) {
      const cachedDoc = cachedDocs[i]
      if (cachedDoc === null) {
        const fetch = fetches[i]
        const {table, id} = fetch
        const customQuery = customRedisQueries[table as string]
        if (customQuery) {
          customQueriesByType[table] = customQueriesByType[table] || []
          customQueriesByType[table].push(id)
        } else {
          missingKeysForRethinkDB.push(fetch)
        }
      }
    }
    const customTypes = Object.keys(customQueriesByType)
    if (missingKeysForRethinkDB.length + customTypes.length === 0) {
      return cachedDocs.map((doc, idx) => hydrateRedisDoc(doc!, fetches[idx].table))
    }

    customTypes.forEach((type) => {
      const customQuery = customRedisQueries[type as keyof typeof customRedisQueries]
      const ids = customQueriesByType[type]
      customQueries.push(customQuery(ids))
    })
    const [docsByKey, ...customResults] = await Promise.all([
      missingKeysForRethinkDB.length === 0
        ? {}
        : this.rethinkDBCache.read(missingKeysForRethinkDB as any),
      ...customQueries
    ])
    customResults.forEach((resultByTypeIdx, idx) => {
      const type = customTypes[idx]
      const ids = customQueriesByType[type]
      ids.forEach((id, idx) => {
        const key = `${type}:${id}`
        docsByKey[key] = resultByTypeIdx[idx]
      })
    })

    const writes = [] as string[][]
    Object.keys(docsByKey).forEach((key) => {
      writes.push(msetpx(key, docsByKey[key]))
    })
    // don't wait for redis to populate the local cache
    this.getRedis().multi(writes).exec()
    return fetchKeys.map((key, idx) => {
      const cachedDoc = cachedDocs[idx]
      return cachedDoc ? hydrateRedisDoc(cachedDoc, fetches[idx].table) : docsByKey[key]
    })
  }

  write = async (writes: RWrite<T>[]) => {
    const results = await this.rethinkDBCache.write(writes as any)
    const redisWrites = [] as string[][]
    results.forEach((result, idx) => {
      // result will be null if the underlying document is not found
      if (!result) return
      const write = writes[idx]
      const {table, id} = write
      const key = `${table}:${id}`
      redisWrites.push(msetpx(key, result))
    })
    // awaiting redis isn't strictly required, can get speedboost by removing the wait
    await this.getRedis().multi(redisWrites).exec()
    return results
  }

  clear = async (key: string) => {
    return this.getRedis().del(key)
  }
  prime = async (table: T, docs: CacheType[T][]) => {
    const writes = docs.map((doc) => {
      return msetpx(`${table}:${doc.id}`, doc)
    })
    await this.getRedis().multi(writes).exec()
  }
  writeTable = async <T extends keyof DBType>(table: T, updater: Partial<CacheType[T]>) => {
    // inefficient to not update rethink & redis in parallel, but writeTable is uncommon
    await this.rethinkDBCache.writeTable(table, updater)
    return new Promise<void>((resolve) => {
      const stream = this.getRedis().scanStream({match: `${table}:*`, count: 100})
      stream.on('data', async (keys) => {
        if (!keys?.length) return
        stream.pause()
        const userStrs = await this.getRedis().mget(...keys)
        const writes = userStrs.map((userStr, idx) => {
          const user = JSON.parse(userStr!)
          Object.assign(user, updater)
          return msetpx(keys[idx], user)
        })
        await this.getRedis().multi(writes).exec()
        stream.resume()
      })
      stream.on('end', () => {
        resolve()
      })
    })
  }
}
