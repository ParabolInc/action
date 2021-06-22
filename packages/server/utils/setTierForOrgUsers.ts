/*
 * We only need to update on `OrganizationUser` objects
 * with `removedAt = null`. Why? `OrganizationUser` row
 * represents one instance of a "membership joining".
 * Once `removedAt` field is populated, that `OrganizationUser`
 * row will not be used again. In case the user is re-invited
 * and rejoins the same org, a new `OrganizationUser` row
 * will be created.
 */
import getRethink from '../database/rethinkDriver'
import {TierEnum} from '../database/types/Invoice'

const setTierForOrgUsers = async (orgId: string) => {
  const r = await getRethink()
  await r
    .table('OrganizationUser')
    .getAll(orgId, {index: 'orgId'})
    .filter({removedAt: null})
    .update(
      {
        tier: (r
          .table('Organization')
          .get(orgId)
          .getField('tier') as unknown) as TierEnum
      },
      {nonAtomic: true}
    )
    .run()
}

export default setTierForOrgUsers
