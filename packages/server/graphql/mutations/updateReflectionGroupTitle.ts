import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import isPhaseComplete from 'parabol-client/utils/meetings/isPhaseComplete'
import stringSimilarity from 'string-similarity'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import segmentIo from '../../utils/segmentIo'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import UpdateReflectionGroupTitlePayload from '../types/UpdateReflectionGroupTitlePayload'

type UpdateReflectionGroupTitleMutationVariables = {
  title: string
  reflectionGroupId: string
}
export default {
  type: UpdateReflectionGroupTitlePayload,
  description: 'Update the title of a reflection group',
  args: {
    reflectionGroupId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    title: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The new title for the group'
    }
  },
  async resolve(
    _source,
    {reflectionGroupId, title}: UpdateReflectionGroupTitleMutationVariables,
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}

    // AUTH
    const viewerId = getUserId(authToken)
    const reflectionGroup = await r
      .table('RetroReflectionGroup')
      .get(reflectionGroupId)
      .run()
    if (!reflectionGroup) {
      return standardError(new Error('Reflection group not found'), {userId: viewerId})
    }
    const {meetingId, smartTitle, title: oldTitle} = reflectionGroup
    if (oldTitle === title) {
      return {error: {message: 'Group already renamed'}}
    }
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    const {endedAt, phases, teamId} = meeting
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }
    if (endedAt) return standardError(new Error('Meeting already ended'), {userId: viewerId})
    if (isPhaseComplete('vote', phases)) {
      return standardError(new Error('Meeting phase already completed'), {userId: viewerId})
    }

    // VALIDATION
    const normalizedTitle = title.trim()
    if (normalizedTitle.length < 1) {
      return standardError(new Error('Reflection group title required'), {userId: viewerId})
    }

    if (normalizedTitle.length > 200) {
      return {error: {message: 'Title is too long'}}
    }

    const allTitles = await r
      .table('RetroReflectionGroup')
      .getAll(meetingId, {index: 'meetingId'})
      .filter({isActive: true})('title')
      .run()
    if (allTitles.includes(normalizedTitle)) {
      return standardError(new Error('Group titles must be unique'), {userId: viewerId})
    }

    // RESOLUTION
    await r
      .table('RetroReflectionGroup')
      .get(reflectionGroupId)
      .update({
        title: normalizedTitle
      })
      .run()

    if (smartTitle && smartTitle === oldTitle) {
      // let's see how smart those smart titles really are. A high similarity means very helpful. Not calling this mutation means perfect!
      const similarity = stringSimilarity.compareTwoStrings(smartTitle, normalizedTitle)
      segmentIo.track({
        userId: viewerId,
        event: 'Smart group title changed',
        properties: {
          similarity,
          smartTitle,
          title: normalizedTitle
        }
      })
    }

    const data = {meetingId, reflectionGroupId}
    publish(
      SubscriptionChannel.MEETING,
      meetingId,
      'UpdateReflectionGroupTitlePayload',
      data,
      subOptions
    )
    return data
  }
}
