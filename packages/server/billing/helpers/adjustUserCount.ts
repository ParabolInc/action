import {InvoiceItemType} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import InvoiceItemHook from '../../database/types/InvoiceItemHook'
import Organization from '../../database/types/Organization'
import OrganizationUser from '../../database/types/OrganizationUser'
import db from '../../db'
import {toEpochSeconds} from '../../utils/epochTime'
import getActiveDomainForOrgId from '../../utils/getActiveDomainForOrgId'
import getDomainFromEmail from '../../utils/getDomainFromEmail'
import isCompanyDomain from '../../utils/isCompanyDomain'
import segmentIo from '../../utils/segmentIo'
import handleEnterpriseOrgQuantityChanges from './handleEnterpriseOrgQuantityChanges'
import processInvoiceItemHook from './processInvoiceItemHook'
import insertOrgUserAudit from '../../postgres/helpers/insertOrgUserAudit'
import {OrganizationUserAuditEventTypeEnum} from '../../postgres/queries/generated/insertOrgUserAuditQuery'
import updateUser from '../../postgres/queries/updateUser'

const maybeUpdateOrganizationActiveDomain = async (orgId: string, userId: string) => {
  const r = await getRethink()
  const organization = await r
    .table('Organization')
    .get(orgId)
    .run()
  const {isActiveDomainTouched, activeDomain} = organization
  // don't modify if the domain was set manually
  if (isActiveDomainTouched) return

  //don't modify if the user doesn't have a company tld or has the same tld as the active one
  const newUser = await db.read('User', userId)
  const {email} = newUser
  const newUserDomain = getDomainFromEmail(email)
  if (!isCompanyDomain(newUserDomain) || newUserDomain === activeDomain) return

  // don't modify if we can't guess the domain or the domain we guess is the current domain
  const domain = await getActiveDomainForOrgId(orgId)
  if (!domain || domain === activeDomain) return

  await r
    .table('Organization')
    .get(orgId)
    .update({
      activeDomain: domain
    })
    .run()
}

const changePause = (inactive: boolean) => async (_orgIds: string[], userId: string) => {
  const r = await getRethink()
  segmentIo.track({
    userId,
    event: inactive ? 'Account Paused' : 'Account Unpaused'
  })
  return Promise.all([
    updateUser({inactive}, userId),
    db.write('User', userId, {inactive}),
    r
      .table('OrganizationUser')
      .getAll(userId, {index: 'userId'})
      .filter({removedAt: null})
      .update({inactive})
      .run()
  ])
}

const addUser = async (orgIds: string[], userId: string) => {
  const r = await getRethink()
  const {organizations, organizationUsers} = await r({
    organizationUsers: (r
      .table('OrganizationUser')
      .getAll(userId, {index: 'userId'})
      .orderBy(r.desc('newUserUntil'))
      .coerceTo('array') as unknown) as OrganizationUser[],
    organizations: (r
      .table('Organization')
      .getAll(r.args(orgIds))
      .coerceTo('array') as unknown) as Organization[]
  }).run()

  const docs = orgIds.map((orgId) => {
    const oldOrganizationUser = organizationUsers.find(
      (organizationUser) => organizationUser.orgId === orgId
    )
    const organization = organizations.find((organization) => organization.id === orgId)!
    // continue the grace period from before, if any OR set to the end of the invoice OR (if it is a free account) no grace period
    const newUserUntil =
      (oldOrganizationUser && oldOrganizationUser.newUserUntil) ||
      organization.periodEnd ||
      new Date()
    return new OrganizationUser({orgId, userId, newUserUntil, tier: organization.tier})
  })

  await r
    .table('OrganizationUser')
    .insert(docs)
    .run()

  await Promise.all(
    orgIds.map((orgId) => {
      return maybeUpdateOrganizationActiveDomain(orgId, userId)
    })
  )
}

const deleteUser = async (orgIds: string[], userId: string) => {
  const r = await getRethink()
  return r
    .table('OrganizationUser')
    .getAll(userId, {index: 'userId'})
    .filter((row) => r.expr(orgIds).contains(row('orgId')))
    .update({
      removedAt: new Date()
    })
    .run()
}

const dbActionTypeLookup = {
  [InvoiceItemType.ADD_USER]: addUser,
  [InvoiceItemType.AUTO_PAUSE_USER]: changePause(true),
  [InvoiceItemType.PAUSE_USER]: changePause(true),
  [InvoiceItemType.REMOVE_USER]: deleteUser,
  [InvoiceItemType.UNPAUSE_USER]: changePause(false)
}

const auditEventTypeLookup = {
  [InvoiceItemType.ADD_USER]: 'added',
  [InvoiceItemType.AUTO_PAUSE_USER]: 'inactivated',
  [InvoiceItemType.PAUSE_USER]: 'inactivated',
  [InvoiceItemType.REMOVE_USER]: 'removed',
  [InvoiceItemType.UNPAUSE_USER]: 'activated'
} as {[key: string]: OrganizationUserAuditEventTypeEnum}

interface Options {
  prorationDate?: Date
}

export default async function adjustUserCount(
  userId: string,
  orgInput: string | string[],
  type: InvoiceItemType,
  options: Options = {}
) {
  const r = await getRethink()
  const orgIds = Array.isArray(orgInput) ? orgInput : [orgInput]

  const dbAction = dbActionTypeLookup[type]
  await dbAction(orgIds, userId)

  const auditEventType = auditEventTypeLookup[type]
  await insertOrgUserAudit(orgIds, userId, auditEventType)

  const paidOrgs = await r
    .table('Organization')
    .getAll(r.args(orgIds), {index: 'id'})
    .filter((org) =>
      org('stripeSubscriptionId')
        .default(null)
        .ne(null)
    )
    .run()

  const proOrgs = paidOrgs.filter((org) => org.tier === 'pro')
  handleEnterpriseOrgQuantityChanges(paidOrgs).catch()
  // personal & enterprise tiers do not follow the per-seat model
  if (proOrgs.length === 0) return
  if (type === InvoiceItemType.REMOVE_USER) {
    // if the user is paused, they've already been removed from stripe
    const user = await db.read('User', userId)
    if (user.inactive) {
      return
    }
  }

  const prorationDate = options.prorationDate ? toEpochSeconds(options.prorationDate) : undefined
  const hooks = proOrgs.map((org) => {
    return new InvoiceItemHook({
      stripeSubscriptionId: org.stripeSubscriptionId!,
      isProrated: org.tier !== 'enterprise',
      orgId: org.id,
      prorationDate,
      type,
      userId
    })
  })

  await r
    .table('InvoiceItemHook')
    .insert(hooks)
    .run()

  hooks.forEach((hook) => {
    processInvoiceItemHook(hook.stripeSubscriptionId).catch()
  })
}
