/*
 * Stripe doesn't offer atmoic quantity updates, so we do it ourselves
 * All quantity changes must go through this flow, even if they're not prorated or prorated with a past date
 * Because we need to get a lock on the quantity change
 * LIMITATIONS:
 *  - Processing queue is not persisted! If the server goes down, quantity will never be increased
 *    - To persist, check for `isPending` records on restart & process them
 *  - Only works with a single redis instance
 *    - For a redis cluster, see https://redis.io/topics/distlock
 * Tags: scaling
 */

import {InvoiceItemType} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import InvoiceItemHook from '../../database/types/InvoiceItemHook'
import {toEpochSeconds} from '../../utils/epochTime'
import RedisLock from '../../utils/RedisLock'
import sendToSentry from '../../utils/sendToSentry'
import StripeManager from '../../utils/StripeManager'

const getTypeDelta = (type: InvoiceItemType) => {
  return [InvoiceItemType.ADD_USER, InvoiceItemType.UNPAUSE_USER].includes(type) ? 1 : -1
}

const getSafeProrationDate = async (
  stripeSubscriptionId: string,
  unsafeProrationDate: number | undefined | null
): Promise<number | undefined> => {
  if (!unsafeProrationDate) return undefined
  const r = await getRethink()
  const hooksWithSameDate = await r
    .table('InvoiceItemHook')
    .getAll(stripeSubscriptionId, {index: 'stripeSubscriptionId'})
    .filter({prorationDate: unsafeProrationDate, isPending: false})
    .run()
  if (hooksWithSameDate.length === 0) return unsafeProrationDate
  // keep going back 2 seconds until we find a safe date
  return getSafeProrationDate(stripeSubscriptionId, unsafeProrationDate - 2)
}

const processInvoiceItemHook = async (stripeSubscriptionId: string) => {
  const redisLock = new RedisLock(stripeSubscriptionId, 3000)
  const lockTTL = await redisLock.checkLock()
  if (lockTTL > 0) {
    // it's possible that the subscription is unlocked before this is up & another call jumps in line
    // but the work to be done is decided after the lock, not before, so order isn't important
    setTimeout(() => {
      processInvoiceItemHook(stripeSubscriptionId)
    }, lockTTL)
    return
  }

  // we have lock, that means we're free to send 1 item to stripe
  const r = await getRethink()

  const hook = ((await r
    .table('InvoiceItemHook')
    .getAll(stripeSubscriptionId, {index: 'stripeSubscriptionId'})
    .filter({isPending: true})
    .orderBy('createdAt')
    .nth(0)
    .run()) as unknown) as InvoiceItemHook

  if (!hook) {
    sendToSentry(new Error('Stripe Hook Not Found'), {
      tags: {stripeSubscriptionId}
    })
    return
  }
  const {id: hookId, type, prorationDate, isProrated, orgId, userId} = hook
  const tentativeProrationDate = isProrated
    ? prorationDate ?? toEpochSeconds(new Date())
    : undefined

  const manager = new StripeManager()
  const [safeProrationDate, stripeSubscription] = await Promise.all([
    getSafeProrationDate(stripeSubscriptionId, tentativeProrationDate),
    manager.retrieveSubscription(stripeSubscriptionId)
  ])
  const stripeQty = stripeSubscription!.quantity || 0
  const nextQuantity = stripeQty + getTypeDelta(type)
  await Promise.all([
    r
      .table('InvoiceItemHook')
      .get(hookId)
      .update({
        isPending: false,
        prorationDate: safeProrationDate,
        quantity: nextQuantity,
        previousQuantity: stripeQty
      })
      .run(),
    manager.updateSubscriptionQuantity(stripeSubscriptionId, nextQuantity, safeProrationDate)
  ])

  const isFlushed = await r
    .table('InvoiceItemHook')
    .getAll(stripeSubscriptionId, {index: 'stripeSubscriptionId'})
    .filter({isPending: true})
    .count()
    .eq(0)
    .run()

  if (isFlushed) {
    const orgUserCount = await r
      .table('OrganizationUser')
      .getAll(orgId, {index: 'orgId'})
      .filter({
        inactive: false,
        removedAt: null
      })
      .count()
      .run()
    if (orgUserCount !== nextQuantity) {
      sendToSentry(new Error('Stripe Quantity Mismatch'), {
        userId,
        tags: {quantity: nextQuantity, expectedQuantity: orgUserCount, stripeSubscriptionId}
      })
    }
  }

  await redisLock.unlock()
}

export default processInvoiceItemHook
