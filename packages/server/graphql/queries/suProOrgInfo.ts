import {GraphQLBoolean, GraphQLList, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {requireSU} from '../../utils/authorization'
import Organization from '../types/Organization'

export default {
  type: new GraphQLList(new GraphQLNonNull(Organization)),
  args: {
    includeInactive: {
      type: GraphQLBoolean,
      defaultValue: false,
      description: 'should organizations without active users be included?'
    }
  },
  async resolve(_source, {includeInactive}, {authToken}) {
    const r = await getRethink()

    // AUTH
    requireSU(authToken)

    // RESOLUTION
    return r
      .table('Organization')
      .getAll('pro', {index: 'tier'})
      .merge((organization) => ({
        users: r
          .table('OrganizationUser')
          .getAll(organization('id'), {index: 'orgId'})
          .filter({removedAt: null})
          .filter((user) => r.branch(includeInactive, true, user('inactive').not()))
          .count()
      }))
      .filter((org) => r.branch(includeInactive, true, org('users').ge(1)))
      .run()
  }
}
