import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import isPhaseComplete from 'parabol-client/utils/meetings/isPhaseComplete'
import RemoveReflectionPayload from '../types/RemoveReflectionPayload'
import removeEmptyReflectionGroup from './helpers/removeEmptyReflectionGroup'
import unlockAllStagesForPhase from 'parabol-client/utils/unlockAllStagesForPhase'
import standardError from '../../utils/standardError'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'

export default {
  type: RemoveReflectionPayload,
  description: 'Remove a reflection',
  args: {
    reflectionId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  async resolve(_source, {reflectionId}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const now = new Date()
    const subOptions = {operationId, mutatorId}

    // AUTH
    const viewerId = getUserId(authToken)
    const reflection = await r
      .table('RetroReflection')
      .get(reflectionId)
      .run()
    if (!reflection) {
      return standardError(new Error('Reflection not found'), {userId: viewerId})
    }
    const {creatorId, meetingId, reflectionGroupId} = reflection
    if (creatorId !== viewerId) {
      return standardError(new Error('Reflection'), {userId: viewerId})
    }
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    const {endedAt, phases, teamId} = meeting
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }
    if (endedAt) return standardError(new Error('Meeting already ended'), {userId: viewerId})
    if (isPhaseComplete('group', phases)) {
      return standardError(new Error('Meeting phase already completed'), {userId: viewerId})
    }

    // RESOLUTION
    await r
      .table('RetroReflection')
      .get(reflectionId)
      .update({
        isActive: false,
        updatedAt: now
      })
      .run()
    await removeEmptyReflectionGroup(reflectionGroupId, reflectionGroupId)
    const reflections = await dataLoader.get('retroReflectionsByMeetingId').load(meetingId)
    let unlockedStageIds
    if (reflections.length === 0) {
      unlockedStageIds = unlockAllStagesForPhase(phases, 'group', true, false)
      await r
        .table('NewMeeting')
        .get(meetingId)
        .update({
          phases
        })
        .run()
    }
    const data = {meetingId, reflectionId, unlockedStageIds}
    publish(SubscriptionChannel.MEETING, meetingId, 'RemoveReflectionPayload', data, subOptions)
    return data
  }
}
