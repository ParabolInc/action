// call with yarn sucrase-node billing/debug.ts
import '../../../scripts/webpack/utils/dotenv'
import StripeManager from '../utils/StripeManager'

const doDebugStuff = async () => {
  const manager = new StripeManager()
  const res = await manager.updateSubscriptionQuantity('foo', 39, 1597966749)
  console.log('res', {res})
}

doDebugStuff()
