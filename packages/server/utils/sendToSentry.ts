import * as Sentry from '@sentry/node'
import db from '../db'

export interface SentryOptions {
  sampleRate?: number
  userId?: string
  ip?: string
  tags?: {
    [tag: string]: string | number
  }
}

// Even though this is a promise we'll never need to await it, so we'll never need to worry about catching an error
const sendToSentry = async (error: Error, options: SentryOptions = {}) => {
  // if (!PROD) {
  console.error('SEND TO SENTRY', error, JSON.stringify(options.tags))
  // }
  const {sampleRate, tags, userId, ip} = options
  if (sampleRate && Math.random() > sampleRate) return
  const fullUser = userId ? await db.read('User', userId) : null
  const user = fullUser ? {id: fullUser.id, email: fullUser.email} : null
  if (user && ip) {
    ;(user as any).ip_address = ip
  }
  Sentry.withScope((scope) => {
    user && scope.setUser(user)
    if (tags) {
      Object.keys(tags).forEach((tag) => {
        scope.setTag(tag, String(tags[tag]))
      })
    }
    Sentry.captureException(error)
  })
}

export default sendToSentry
