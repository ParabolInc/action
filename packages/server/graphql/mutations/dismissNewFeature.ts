import {GraphQLNonNull} from 'graphql'
import db from '../../db'
import {getUserId} from '../../utils/authorization'
import DismissNewFeaturePayload from '../types/DismissNewFeaturePayload'
import {dismissNewFeatureQuery} from '../../postgres/queries/generated/dismissNewFeatureQuery'
import catchAndLog from '../../postgres/utils/catchAndLog'
import getPg from '../../postgres/getPg'

export default {
  type: new GraphQLNonNull(DismissNewFeaturePayload),
  description: `Redeem an invitation token for a logged in user`,
  // rate limited because a notificationId subverts the expiration of the token & we don't want any brute forces for expired tokens
  resolve: async (_source, _args, {authToken}) => {
    // AUTH
    const viewerId = getUserId(authToken)
    const update = {newFeatureId: null}
    await Promise.all([
      catchAndLog(() => dismissNewFeatureQuery.run({ids: [viewerId]}, getPg())),
      db.write('User', viewerId, update)
    ])
    return {}
  }
}
