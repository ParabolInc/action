import {TierEnum} from 'parabol-client/types/graphql'
import getRethink from '../../../database/rethinkDriver'
import {fromEpochSeconds} from '../../../utils/epochTime'
import setUserTierForOrgId from '../../../utils/setUserTierForOrgId'
import setTierForOrgUsers from '../../../utils/setTierForOrgUsers'
import StripeManager from '../../../utils/StripeManager'
import getCCFromCustomer from './getCCFromCustomer'
import catchAndLog from '../../../postgres/utils/catchAndLog'
import {
  IUpdateTeamByOrgIdQueryParams,
  updateTeamByOrgIdQuery
} from '../../../postgres/queries/generated/updateTeamByOrgIdQuery'
import getPg from '../../../postgres/getPg'

const upgradeToPro = async (orgId: string, source: string, email: string) => {
  const r = await getRethink()
  const now = new Date()

  const organization = await r
    .table('Organization')
    .get(orgId)
    .run()
  if (!organization) throw new Error('Bad orgId')

  const {stripeId, stripeSubscriptionId} = organization
  const quantity = await r
    .table('OrganizationUser')
    .getAll(orgId, {index: 'orgId'})
    .filter({removedAt: null, inactive: false})
    .count()
    .run()

  const manager = new StripeManager()
  const customer = stripeId
    ? await manager.updatePayment(stripeId, source)
    : await manager.createCustomer(orgId, email, source)

  let subscriptionFields = {}
  if (!stripeSubscriptionId) {
    const subscription = await manager.createProSubscription(customer.id, orgId, quantity)
    subscriptionFields = {
      periodEnd: fromEpochSeconds(subscription.current_period_end),
      periodStart: fromEpochSeconds(subscription.current_period_start),
      stripeSubscriptionId: subscription.id
    }
  }

  await Promise.all([
    r({
      updatedOrg: r
        .table('Organization')
        .get(orgId)
        .update({
          ...subscriptionFields,
          creditCard: getCCFromCustomer(customer),
          tier: TierEnum.pro,
          stripeId: customer.id,
          updatedAt: now
        }),
      teamIds: r
        .table('Team')
        .getAll(orgId, {index: 'orgId'})
        .update({
          isPaid: true,
          tier: TierEnum.pro,
          updatedAt: now
        })
    }).run(),
    catchAndLog(() =>
      updateTeamByOrgIdQuery.run(
        {
          isPaid: true,
          tier: TierEnum.pro,
          updatedAt: now,
          orgId
        } as IUpdateTeamByOrgIdQueryParams,
        getPg()
      )
    )
  ])

  await Promise.all([setUserTierForOrgId(orgId), setTierForOrgUsers(orgId)])
}

export default upgradeToPro
