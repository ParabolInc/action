import {GraphQLList, GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import User from '../../database/types/User'
import db from '../../db'
import {requireSU} from '../../utils/authorization'
import publish from '../../utils/publish'
import AddFeatureFlagPayload from '../types/AddFeatureFlagPayload'
import UserFlagEnum from '../types/UserFlagEnum'
import {appendUserFeatureFlagsQuery} from '../../postgres/queries/generated/appendUserFeatureFlagsQuery'
import getPg from '../../postgres/getPg'
import catchAndLog from '../../postgres/utils/catchAndLog'

export default {
  type: GraphQLNonNull(AddFeatureFlagPayload),
  description: 'Give someone advanced features in a flag',
  args: {
    emails: {
      type: GraphQLList(GraphQLNonNull(GraphQLString)),
      description: `a list of the complete or partial email of the person to whom you are giving advanced features.
      Matches via a regex to support entire domains`
    },
    domain: {
      type: GraphQLString,
      description: 'grant access to an entire domain. the part of the email after the @'
    },
    flag: {
      type: new GraphQLNonNull(UserFlagEnum),
      description: 'the flag that you want to give to the user'
    }
  },
  async resolve(
    _source,
    {emails, domain, flag}: {emails: string[] | null; domain: string | null; flag: string},
    {authToken, dataLoader}
  ) {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {operationId}

    // AUTH
    requireSU(authToken)

    // RESOLUTION
    const users = [] as User[]
    if (emails) {
      const usersByEmail = await r
        .table('User')
        .getAll(r.args(emails), {index: 'email'})
        .run()
      users.push(...usersByEmail)
    }
    if (domain) {
      const usersByDomain = await r
        .table('User')
        .filter((doc) => (doc as any)('email').match(domain))
        .run()
      users.push(...usersByDomain)
    }
    await db.prime('User', users)

    if (users.length === 0) {
      return {error: {message: 'No users found matching the email or domain'}}
    }

    const reqlUpdater = (user) => ({
      featureFlags: user('featureFlags')
        .default([])
        .append(flag)
        .distinct()
    })
    const userIds = users.map(({id}) => id)
    await Promise.all([
      catchAndLog(() => appendUserFeatureFlagsQuery.run({ids: userIds, flag}, getPg())),
      db.writeMany('User', userIds, reqlUpdater)
    ])
    userIds.forEach((userId) => {
      const data = {userId}
      publish(SubscriptionChannel.NOTIFICATION, userId, 'AddFeatureFlagPayload', data, subOptions)
    })
    return {userIds}
  }
}
