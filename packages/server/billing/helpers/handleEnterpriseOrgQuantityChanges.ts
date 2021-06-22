import getRethink from '../../database/rethinkDriver'
import Organization from '../../database/types/Organization'
import segmentIo from '../../utils/segmentIo'
import StripeManager from '../../utils/StripeManager'

const sendEnterpriseOverageToSegment = async (organization: Organization) => {
  const r = await getRethink()
  const manager = new StripeManager()
  const {id: orgId, stripeSubscriptionId} = organization
  if (!stripeSubscriptionId) return
  const [orgUserCount, subscription] = await Promise.all([
    r
      .table('OrganizationUser')
      .getAll(orgId, {index: 'orgId'})
      .filter({removedAt: null, inactive: false})
      .count()
      .run(),
    manager.retrieveSubscription(stripeSubscriptionId)
  ])
  const {quantity} = subscription
  if (!quantity) return
  if (orgUserCount > quantity) {
    const billingLeaderOrgUser = await r
      .table('OrganizationUser')
      .getAll(orgId, {index: 'orgId'})
      .filter({removedAt: null, role: 'BILLING_LEADER'})
      .nth(0)
      .run()
    const {id: userId} = billingLeaderOrgUser
    segmentIo.track({
      userId,
      event: 'Enterprise Over User Limit',
      properties: {orgId}
    })
  }
}

const handleEnterpriseOrgQuantityChanges = async (paidOrgs: Organization[]) => {
  const enterpriseOrgs = paidOrgs.filter((org) => org.tier === 'enterprise')
  if (enterpriseOrgs.length === 0) return
  enterpriseOrgs.forEach(sendEnterpriseOverageToSegment)
}

export default handleEnterpriseOrgQuantityChanges
