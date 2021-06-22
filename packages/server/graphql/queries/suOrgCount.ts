import {GraphQLInt} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {TierEnum as ETierEnum} from '../../database/types/Invoice'
import {requireSU} from '../../utils/authorization'
import TierEnum from '../types/TierEnum'

export default {
  type: GraphQLInt,
  args: {
    minOrgSize: {
      type: GraphQLInt,
      defaultValue: 2,
      description: 'the minimum number of users within the org to count it'
    },
    tier: {
      type: TierEnum,
      defaultValue: 'pro' as ETierEnum,
      description: 'which tier of org shall we count?'
    }
  },
  // Only counts organizations with active users
  async resolve(_source, {minOrgSize, tier}, {authToken}) {
    const r = await getRethink()

    // AUTH
    requireSU(authToken)

    // RESOLUTION
    return (r
      .table('OrganizationUser')
      .getAll(
        ([tier, false] as unknown) as string, // super hacky type fix bc no fn overload is defined in the type file for this valid invocation
        ({index: 'tierInactive'} as unknown) as undefined
      )
      .filter({removedAt: null})
      .group('orgId') as any)
      .count()
      .ungroup()
      .filter((group) => group('reduction').ge(minOrgSize))
      .count()
      .run()
  }
}
