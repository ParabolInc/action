import Redis from 'ioredis'
import numToBase64 from './numToBase64'
import sendToSentry from './sendToSentry'

const MAX_TIMEOUT = 10000
interface Job {
  resolve: (payload: any) => void
  timeoutId: NodeJS.Timeout
}

const {SERVER_ID, REDIS_URL} = process.env
export default class PubSubPromise<Request, Response> {
  jobs = {} as {[jobId: string]: Job}
  publisher = new Redis(REDIS_URL)
  subscriber = new Redis(REDIS_URL)
  subChannel: string
  pubChannel: string
  jobCounter = 0

  constructor(pubChannel: string, subChannel: string) {
    this.pubChannel = pubChannel
    this.subChannel = subChannel
  }
  onMessage = (_channel: string, message: string) => {
    const {jobId, response} = JSON.parse(message)
    const cachedJob = this.jobs[jobId]
    if (!cachedJob) return
    delete this.jobs[jobId]
    const {resolve, timeoutId} = cachedJob
    clearTimeout(timeoutId)
    resolve(response)
  }

  subscribe = () => {
    this.subscriber.on('message', this.onMessage)
    this.subscriber.subscribe(this.subChannel)
  }

  publish = (request: Request) => {
    return new Promise<Response>((resolve, reject) => {
      const nextJob = numToBase64(this.jobCounter++)
      const jobId = `${SERVER_ID}:${nextJob}`
      const timeoutId = setTimeout(() => {
        delete this.jobs[jobId]
        reject(new Error('Redis took too long to respond'))
      }, MAX_TIMEOUT)
      const previousJob = this.jobs[jobId]
      if (previousJob) {
        sendToSentry(new Error('REDIS JOB ALREADY EXISTS'), {tags: {jobId}})
      }
      this.jobs[jobId] = {resolve, timeoutId}
      const message = JSON.stringify({jobId, request})
      this.publisher.publish(this.pubChannel, message)
    })
  }
}
