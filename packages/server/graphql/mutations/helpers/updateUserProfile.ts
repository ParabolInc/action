import {getUserId, isAuthenticated} from '../../../utils/authorization'
import getRethink from '../../../database/rethinkDriver'
import standardError from '../../../utils/standardError'
import makeUserServerSchema from 'parabol-client/validation/makeUserServerSchema'
import {JSDOM} from 'jsdom'
import sanitizeSVG from '@mattkrick/sanitize-svg'
import linkify from 'parabol-client/utils/linkify'
import TeamMember from '../../../database/types/TeamMember'
import db from '../../../db'
import segmentIo from '../../../utils/segmentIo'
import publish from '../../../utils/publish'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import fetch from 'node-fetch'
import updateUser from '../../../postgres/queries/updateUser'

const updateUserProfile = async (
  _source,
  {updatedUser},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const r = await getRethink()
  const now = new Date()
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}

  // AUTH
  if (!isAuthenticated(authToken)) return standardError(new Error('Not authenticated'))
  const userId = getUserId(authToken)

  // VALIDATION
  const schema = makeUserServerSchema()
  const {data: validUpdatedUser, errors} = schema(updatedUser) as any
  if (Object.keys(errors).length) {
    return standardError(new Error('Failed input validation'), {userId})
  }

  if (validUpdatedUser.picture && validUpdatedUser.picture.endsWith('.svg')) {
    const res = await fetch(validUpdatedUser.picture)
    const buffer = await res.buffer()
    const {window} = new JSDOM()
    const sanitaryPicture = await sanitizeSVG(buffer, window)
    if (!sanitaryPicture) {
      return {error: {message: 'Attempted Stored XSS attack'}}
    }
  }

  if (validUpdatedUser.preferredName) {
    const links = linkify.match(validUpdatedUser.preferredName)
    if (links) {
      return {
        error: {message: 'Name cannot be a hyperlink'}
      }
    }
  }

  // RESOLUTION
  const updates = {
    ...validUpdatedUser,
    updatedAt: now
  }
  // propagate denormalized changes to TeamMember
  const [teamMembers] = await Promise.all([
    (r
      .table('TeamMember')
      .getAll(userId, {index: 'userId'})
      .update(updates, {returnChanges: true})('changes')('new_val')
      .default([])
      .run() as unknown) as TeamMember[],
    db.write('User', userId, updates),
    updateUser(updates, userId)
  ])
  //
  // If we ever want to delete the previous profile images:
  //
  // const previousProfile = previousValue(dbProfileChanges);
  // if (previousProfile && urlIsPossiblyOnS3(previousProfile.picture)) {
  // // possible remove prior profile image from CDN asynchronously
  //   s3DeleteObject(previousProfile.picture)
  //   .catch(console.warn.bind(console));
  // }
  //
  if (validUpdatedUser.preferredName) {
    segmentIo.track({
      userId,
      event: 'Changed name',
      properties: {
        name: validUpdatedUser.preferredName
      }
    })
    segmentIo.identify({
      userId,
      traits: {
        name: validUpdatedUser.preferredName
      }
    })
  }

  const teamIds = teamMembers.map(({teamId}) => teamId)
  teamIds.forEach((teamId) => {
    const data = {userId, teamIds: [teamId]}
    publish(SubscriptionChannel.TEAM, teamId, 'UpdateUserProfilePayload', data, subOptions)
  })
  return {userId, teamIds}
}

export default updateUserProfile
