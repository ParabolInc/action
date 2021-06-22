import getRethink from '../database/rethinkDriver'
import getTeamsByOrgId from '../postgres/queries/getTeamsByOrgId'

// Only does something if the organization is empty & not paid
// safeArchiveTeam & downgradeToPersonal should be called before calling this

const safeArchiveEmptyPersonalOrganization = async (orgId: string) => {
  const r = await getRethink()
  const now = new Date()
  const orgTeams = await getTeamsByOrgId(orgId)
  const teamCountRemainingOnOldOrg = orgTeams.length

  if (teamCountRemainingOnOldOrg > 0) return
  const org = await r
    .table('Organization')
    .get(orgId)
    .run()
  if (org.tier !== 'personal') return

  await r
    .table('OrganizationUser')
    .getAll(orgId, {index: 'orgId'})
    .filter({removedAt: null})
    .update({removedAt: now})
    .run()
}

export default safeArchiveEmptyPersonalOrganization
