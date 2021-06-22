import {DBType} from '../database/rethinkDriver'
import RedisCache, {CacheType} from './RedisCache'
import {RWrite, Updater} from './RethinkDBCache'

const resolvedPromise = Promise.resolve()

type Thunk = () => void
export default class LocalCache<T extends keyof CacheType> {
  private cacheMap = {} as {[key: string]: {ts: number; promise: Promise<any>}}
  private hasReadDispatched = true
  private hasWriteDispatched = true
  private fetches = [] as {
    table: keyof CacheType
    id: string
    resolve: (payload: any) => void
    reject: (err: any) => void
  }[]
  private cacheHits = [] as Thunk[]
  private writes = [] as {
    table: T
    id: string
    resolve: (payload: any) => void
    updater: Updater<CacheType[T]>
  }[]
  private ttl: number
  private redisCache = new RedisCache()
  // private redisCache = new RedisCache(this.clearLocal)
  constructor(ttl: number) {
    this.ttl = ttl
    setInterval(this.gc, this.ttl).unref()
  }

  private gc = () => {
    const keys = Object.keys(this.cacheMap)
    const oldestValidTS = Date.now() - this.ttl
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const {ts} = this.cacheMap[key]
      if (ts < oldestValidTS) {
        delete this.cacheMap[key]
      }
    }
  }
  private resolveCacheHits(cacheHits: Thunk[]) {
    // cacheHits are possibly from the previous batch, hence the param
    for (let i = 0; i < cacheHits.length; i++) {
      cacheHits[i]()
    }
  }
  private dispatchReadBatch = async () => {
    this.hasReadDispatched = true
    // grab a reference to them now because after await is called they may be overwritten when a new batch is created
    const {fetches, cacheHits} = this
    if (fetches.length === 0) {
      this.resolveCacheHits(cacheHits)
      return
    }
    try {
      const values = await this.redisCache.read(fetches)
      this.resolveCacheHits(cacheHits)
      for (let i = 0; i < fetches.length; i++) {
        const {resolve, reject} = fetches[i]
        const value = values[i]
        const handle = value instanceof Error ? reject : resolve
        handle(value)
      }
    } catch (e) {
      this.resolveCacheHits(cacheHits)
      for (let i = 0; i < fetches.length; i++) {
        const fetch = fetches[i]
        const {table, id, reject} = fetch
        const key = `${table}:${id}`
        this.clearLocal(key)
        reject(e)
      }
    }
  }

  private clearLocal(key: string) {
    delete this.cacheMap[key]
    return this
  }
  private primeLocal(key: string, doc: CacheType[keyof CacheType]) {
    this.cacheMap[key] = {
      ts: Date.now(),
      promise: Promise.resolve(doc)
    }
  }

  private dispatchWriteBatch = async () => {
    this.hasWriteDispatched = true
    const {writes} = this
    const results = await this.redisCache.write(writes as any)
    writes.forEach(({resolve, table, id}, idx) => {
      const key = `${table}:${id}`
      const result = results[idx]
      this.primeLocal(key, result)
      resolve(result)
    })
  }
  async clear(table: T, id: string) {
    const key = `${table}:${id}`
    this.clearLocal(key)
    await this.redisCache.clear(key)
    return this
  }

  async prime(table: T, docs: CacheType[T][]) {
    docs.forEach((doc) => {
      const key = `${table}:${doc.id}`
      this.primeLocal(key, doc)
    })
    this.redisCache.prime(table, docs)
    return this
  }
  async read<T extends keyof CacheType>(table: T, id: string) {
    // return 42 as any as CacheType[T]
    if (this.hasReadDispatched) {
      this.hasReadDispatched = false
      this.fetches = []
      this.cacheHits = []
      resolvedPromise.then(() => {
        process.nextTick(this.dispatchReadBatch)
      })
    }
    const key = `${table}:${id}`
    const cachedRecord = this.cacheMap[key]
    if (cachedRecord) {
      cachedRecord.ts = Date.now()
      // there's marginal savings to be had by reusing promises instead of creating a new one for each cache hit
      // not implemented for the sake of simplicity
      return new Promise<CacheType[T]>((resolve) => {
        this.cacheHits.push(() => {
          resolve(cachedRecord.promise)
        })
      })
    }
    const promise = new Promise<CacheType[T]>((resolve, reject) => {
      this.fetches.push({resolve, reject, table, id})
    })
    this.cacheMap[key] = {ts: Date.now(), promise}
    return promise
  }

  async readMany<T extends keyof CacheType>(table: T, ids: string[]) {
    const loadPromises = [] as Promise<CacheType[T]>[]
    for (let i = 0; i < ids.length; i++) {
      loadPromises.push(this.read(table, ids[i]).catch((error) => error))
    }
    return Promise.all(loadPromises)
  }
  async write<P extends CacheType[T]>(table: T, id: string, updater: Updater<P>) {
    if (this.hasWriteDispatched) {
      this.hasWriteDispatched = false
      this.writes = [] as (RWrite<P> & {resolve: (payload: any) => void})[]
      resolvedPromise.then(() => {
        process.nextTick(this.dispatchWriteBatch)
      })
    }
    return new Promise<P>((resolve) => {
      this.writes.push({id, table, updater, resolve})
    })
  }

  async writeMany<P extends CacheType[T]>(table: T, ids: string[], updater: Updater<P>) {
    return Promise.all(ids.map((id) => this.write(table, id, updater)))
  }

  // currently doesn't support updater functions
  async writeTable<T extends keyof DBType, P extends Partial<DBType[T]>>(table: T, updater: P) {
    Object.keys(this.cacheMap).forEach((key) => {
      if (!key.startsWith(`${table}:`)) return
      const doc = this.cacheMap[key]
      Object.assign(doc, updater)
    })
    await this.redisCache.writeTable(table, updater)
  }
}
