import {GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {TierEnum as ETierEnum} from '../../database/types/Invoice'
import errorFilter from '../errorFilter'
import {GQLContext} from '../graphql'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import Organization from './Organization'
import TierEnum from './TierEnum'

const Company = new GraphQLObjectType<any, GQLContext>({
  name: 'Company',
  description: 'A grouping of organizations. Automatically grouped by top level domain of each',
  fields: () => ({
    id: {
      type: GraphQLNonNull(GraphQLID),
      description: 'the top level domain'
    },
    activeTeamCount: {
      type: GraphQLNonNull(GraphQLInt),
      description: 'the number of active teams across all organizations',
      resolve: async ({id: domain}, _args, {dataLoader}) => {
        const organizations = await dataLoader.get('organizationsByActiveDomain').load(domain)
        const orgIds = organizations.map(({id}) => id)
        const teamsByOrgId = await dataLoader.get('teamsByOrgId').loadMany(orgIds)
        const teams = teamsByOrgId.flat()
        return teams.length
      }
    },
    activeUserCount: {
      type: GraphQLNonNull(GraphQLInt),
      description: 'the number of active users across all organizations',
      resolve: async ({id: domain}, _args, {dataLoader}) => {
        const organizations = await dataLoader.get('organizationsByActiveDomain').load(domain)
        const orgIds = organizations.map(({id}) => id)
        const organizationUsersByOrgId = (
          await dataLoader.get('organizationUsersByOrgId').loadMany(orgIds)
        ).filter(errorFilter)
        const organizationUsers = organizationUsersByOrgId.flat()
        const activeOrganizationUsers = organizationUsers.filter(
          (organizationUser) => !organizationUser.inactive
        )
        const userIds = activeOrganizationUsers.map((organizationUser) => organizationUser.userId)
        const uniqueUserIds = new Set(userIds)
        return uniqueUserIds.size
      }
    },
    lastMetAt: {
      type: GraphQLISO8601Type,
      description:
        'the last time any team in the organization started a meeting, null if no meetings were ever run',
      resolve: async ({id: domain}, _args, {dataLoader}) => {
        const r = await getRethink()
        const organizations = await dataLoader.get('organizationsByActiveDomain').load(domain)
        const orgIds = organizations.map(({id}) => id)
        const teamsByOrgId = (await dataLoader.get('teamsByOrgId').loadMany(orgIds)).filter(
          errorFilter
        )
        const teams = teamsByOrgId.flat()
        const teamIds = teams.map(({id}) => id)
        if (teamIds.length === 0) return 0
        const lastMetAt = await r
          .table('NewMeeting')
          .getAll(r.args(teamIds), {index: 'teamId'})
          .max('createdAt' as any)('createdAt')
          .default(null)
          .run()
        return lastMetAt
      }
    },
    meetingCount: {
      type: GraphQLNonNull(GraphQLInt),
      description: 'the total number of meetings started across all teams on all organizations',
      resolve: async ({id: domain}, _args, {dataLoader}) => {
        const r = await getRethink()
        const organizations = await dataLoader.get('organizationsByActiveDomain').load(domain)
        const orgIds = organizations.map(({id}) => id)
        const teamsByOrgId = (await dataLoader.get('teamsByOrgId').loadMany(orgIds)).filter(
          errorFilter
        )
        const teams = teamsByOrgId.flat()
        const teamIds = teams.map(({id}) => id)
        if (teamIds.length === 0) return 0
        return r
          .table('NewMeeting')
          .getAll(r.args(teamIds), {index: 'teamId'})
          .count()
          .default(0)
          .run()
      }
    },
    monthlyTeamStreakMax: {
      type: GraphQLNonNull(GraphQLInt),
      description:
        'the longest monthly streak for meeting at least once per month for any team in the company',
      resolve: async ({id: domain}, _args, {dataLoader}) => {
        const r = await getRethink()
        const organizations = await dataLoader.get('organizationsByActiveDomain').load(domain)
        const orgIds = organizations.map(({id}) => id)
        const teamsByOrgId = (await dataLoader.get('teamsByOrgId').loadMany(orgIds)).filter(
          errorFilter
        )
        const teams = teamsByOrgId.flat()
        const teamIds = teams.map(({id}) => id)
        if (teamIds.length === 0) return 0
        return (
          r
            .table('NewMeeting')
            .getAll(r.args(teamIds), {index: 'teamId'})
            .filter((row) =>
              row('endedAt')
                .default(null)
                .ne(null)
            )
            // number of months since unix epoch
            .merge((row) => ({
              epochMonth: row('endedAt')
                .month()
                .add(
                  row('endedAt')
                    .year()
                    .mul(12)
                )
            }))
            .group((row) => [row('teamId'), row('epochMonth')])
            .count()
            .ungroup()
            .map((row) => ({
              teamId: row('group')(0),
              epochMonth: row('group')(1)
            }))
            .group('teamId')('epochMonth')
            .ungroup()
            .map((row) => ({
              teamId: row('group'),
              epochMonth: row('reduction'),
              // epochMonth shifted 1 index position
              shift: row('reduction')
                .deleteAt(0)
                .map((z) => z.add(-1))
            }))
            .merge((row) => ({
              // 1 if there are 2 consecutive epochMonths next to each other, else 0
              teamStreak: r
                .map(row('shift'), row('epochMonth'), (shift, epochMonth) =>
                  r.branch(shift.eq(epochMonth), '1', '0')
                )
                .reduce((left, right) => left.add(right).default(''))
                .default('')
                // get an array of all the groupings of 1
                .split('0')
                .map((val) => val.count())
                .max()
                .add(1)
            }))
            .max('teamStreak')('teamStreak')
            .run()
        )
      }
    },
    organizations: {
      description: 'Get the list of all organizations that belong to the company',
      type: GraphQLNonNull(GraphQLList(GraphQLNonNull(Organization))),
      async resolve({id: domain}, _args, {dataLoader}) {
        const organizations = await dataLoader.get('organizationsByActiveDomain').load(domain)
        return organizations
      }
    },
    tier: {
      description: 'The highest tier for any organization within the company',
      type: GraphQLNonNull(TierEnum),
      async resolve({id: domain}, _args, {dataLoader}) {
        const organizations = await dataLoader.get('organizationsByActiveDomain').load(domain)
        const tiers: ETierEnum[] = organizations.map(({tier}) => tier)
        if (tiers.includes('enterprise')) return 'enterprise'
        if (tiers.includes('pro')) return 'pro'
        return 'personal'
      }
    },
    userCount: {
      type: GraphQLNonNull(GraphQLInt),
      description: 'the total number of users across all organizations',
      resolve: async ({id: domain}, _args, {dataLoader}) => {
        const organizations = await dataLoader.get('organizationsByActiveDomain').load(domain)
        const orgIds = organizations.map(({id}) => id)
        const organizationUsersByOrgId = (
          await dataLoader.get('organizationUsersByOrgId').loadMany(orgIds)
        ).filter(errorFilter)
        const organizationUsers = organizationUsersByOrgId.flat()
        const userIds = organizationUsers.map((organizationUser) => organizationUser.userId)
        const uniqueUserIds = new Set(userIds)
        return uniqueUserIds.size
      }
    }
  })
})

export default Company
