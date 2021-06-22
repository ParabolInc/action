import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import User from '../../database/types/User'
import db from '../../db'
import {getUserId, isSuperUser} from '../../utils/authorization'
import segmentIo from '../../utils/segmentIo'
import {GQLContext} from '../graphql'
import DeleteUserPayload from '../types/DeleteUserPayload'
import removeFromOrg from './helpers/removeFromOrg'
import getDeletedEmail from '../../utils/getDeletedEmail'
import updateUser from '../../postgres/queries/updateUser'

export default {
  type: GraphQLNonNull(DeleteUserPayload),
  description: `Delete a user, removing them from all teams and orgs`,
  args: {
    userId: {
      type: GraphQLID,
      description: 'a userId'
    },
    email: {
      type: GraphQLID,
      description: 'the user email'
    },
    reason: {
      type: GraphQLString,
      description: 'the reason why the user wants to delete their account'
    }
  },
  resolve: async (
    _source,
    {userId, email, reason}: {userId?: string; email?: string; reason?: string},
    {authToken, dataLoader}: GQLContext
  ) => {
    const r = await getRethink()
    // AUTH
    if (userId && email) {
      return {error: {message: 'Provide userId XOR email'}}
    }
    if (!userId && !email) {
      return {error: {message: 'Provide a userId or email'}}
    }
    const su = isSuperUser(authToken)
    const viewerId = getUserId(authToken)

    const index = userId ? 'id' : 'email'
    const user = (await r
      .table('User')
      .getAll((userId || email)!, {index})
      .nth(0)
      .default(null)
      .run()) as User
    if (!su) {
      if (!user || userId !== viewerId) {
        return {error: {message: 'Cannot delete someone else'}}
      }
    } else if (!user) {
      return {error: {message: 'User not found'}}
    }
    const {id: userIdToDelete} = user
    const orgUsers = await dataLoader.get('organizationUsersByUserId').load(userIdToDelete)
    const orgIds = orgUsers.map((orgUser) => orgUser.orgId)
    await Promise.all(
      orgIds.map((orgId) => removeFromOrg(userIdToDelete, orgId, undefined, dataLoader))
    )
    const validReason = reason?.trim().slice(0, 2000) || 'No reason provided'
    if (userId) {
      segmentIo.track({
        userId,
        event: 'Account Removed',
        properties: {
          reason: validReason
        }
      })
    }
    // do this after 30 seconds so any segment API calls can still get the email
    setTimeout(() => {
      db.write('User', userIdToDelete, {
        isRemoved: true,
        email: 'DELETED',
        reasonRemoved: validReason
      })
      updateUser(
        {
          isRemoved: true,
          email: getDeletedEmail(userId),
          reasonRemoved: validReason
        },
        userIdToDelete
      )
    }, 30000)
    return {}
  }
}
