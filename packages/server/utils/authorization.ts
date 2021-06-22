import getRethink from '../database/rethinkDriver'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import AuthToken from '../database/types/AuthToken'
import OrganizationUser from '../database/types/OrganizationUser'
import {DataLoaderWorker} from '../graphql/graphql'

export const getUserId = (authToken: any) => {
  return authToken && typeof authToken === 'object' ? (authToken.sub as string) : ''
}

export const isAuthenticated = (authToken: any): authToken is AuthToken => {
  return typeof authToken?.sub === 'string'
}

export const isSuperUser = (authToken) => {
  const userId = getUserId(authToken)
  return userId ? authToken.rol === 'su' : false
}

export const isTeamMember = (authToken: AuthToken, teamId: string) => {
  const {tms} = authToken
  return Array.isArray(tms) && tms.includes(teamId)
}

// export const isPastOrPresentTeamMember = async (viewerId: string, teamId: string) => {
//   const r = await getRethink()
//   return r
//     .table('TeamMember')
//     .getAll(teamId, {index: 'teamId'})
//     .filter({userId: viewerId})
//     .count()
//     .ge(1)
//     .run()
// }

export const isTeamLead = async (userId, teamId) => {
  const r = await getRethink()
  const teamMemberId = toTeamMemberId(teamId, userId)
  return r
    .table('TeamMember')
    .get(teamMemberId)('isLead')
    .default(false)
    .run()
}

export const requireSU = (authToken) => {
  if (!isSuperUser(authToken)) {
    throw new Error('Unauthorized. Must be a super user to run this query.')
  }
}

interface Options {
  clearCache?: boolean
}
export const isUserBillingLeader = async (
  userId: string,
  orgId: string,
  dataLoader: DataLoaderWorker,
  options?: Options
) => {
  const organizationUsers = await dataLoader.get('organizationUsersByUserId').load(userId)
  const organizationUser = organizationUsers.find(
    (organizationUser) => organizationUser.orgId === orgId
  )
  if (options && options.clearCache) {
    dataLoader.get('organizationUsersByUserId').clear(userId)
  }
  return organizationUser ? organizationUser.role === 'BILLING_LEADER' : false
}

export const isUserInOrg = async (userId, orgId) => {
  const r = await getRethink()
  const organizationUser = await r
    .table('OrganizationUser')
    .getAll(userId, {index: 'userId'})
    .filter({orgId})
    .filter({removedAt: null})
    .nth(0)
    .run()
  return !!organizationUser
}

export const isOrgLeaderOfUser = async (authToken, userId) => {
  const r = await getRethink()
  const viewerId = getUserId(authToken)
  const {viewerOrgIds, userOrgIds} = await r({
    viewerOrgIds: (r
      .table('OrganizationUser')
      .getAll(viewerId, {index: 'userId'})
      .filter({removedAt: null, role: 'BILLING_LEADER'})('orgId')
      .coerceTo('array') as any) as OrganizationUser[],
    userOrgIds: (r
      .table('OrganizationUser')
      .getAll(userId, {index: 'userId'})
      .filter({removedAt: null})('orgId')
      .coerceTo('array') as any) as OrganizationUser[]
  }).run()
  const uniques = new Set(viewerOrgIds.concat(userOrgIds))
  const total = viewerOrgIds.length + userOrgIds.length
  return uniques.size < total
}

// this function is not used anywhere
export const isPaidTier = async (teamId) => {
  const r = await getRethink()
  const tier = await r
    .table('Team')
    .get(teamId)('tier')
    .run()
  return tier !== 'personal'
}
