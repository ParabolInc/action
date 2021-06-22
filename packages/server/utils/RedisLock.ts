import sleep from '../../client/utils/sleep'
import generateUID from '../generateUID'
import getRedis from './getRedis'

export default class RedisLock {
  value = generateUID()
  key: string
  ttl: number
  waitTime: number
  redis = getRedis()

  constructor(key: string, ttl: number) {
    this.key = `lock:${key}`
    this.ttl = ttl
    this.waitTime = 0
  }

  checkLock = async () => {
    // returns time left until key expires. 0 means it doesn't exist
    const res = await this.redis.set(this.key, this.value, 'PX', this.ttl, 'NX')
    if (res === 'OK') return -1
    return this.redis.pttl(this.key)
  }

  unlock = async () => {
    const activeValue = await this.redis.get(this.key)
    if (activeValue === this.value) {
      await this.redis.del(this.key)
      return true
    }
    return undefined
  }

  lock = async (maxWait: number) => {
    for (let i = 0; i < 1000; i++) {
      const lockTTL = await this.checkLock()
      if (lockTTL <= 0) return
      this.waitTime += lockTTL
      if (this.waitTime > maxWait) {
        throw new Error(`Could not achieve lock for ${this.key} after ${maxWait}ms`)
      }
      await sleep(lockTTL)
    }
  }
}
