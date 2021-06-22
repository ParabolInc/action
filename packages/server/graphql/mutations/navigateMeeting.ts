import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {getUserId} from '../../utils/authorization'
import publish from '../../utils/publish'
import NavigateMeetingPayload from '../types/NavigateMeetingPayload'
import findStageById from 'parabol-client/utils/meetings/findStageById'
import handleCompletedStage from './helpers/handleCompletedStage'
import unlockNextStages from 'parabol-client/utils/unlockNextStages'
import startStage_ from 'parabol-client/utils/startStage_'
import standardError from '../../utils/standardError'
import Meeting from '../../database/types/Meeting'
import removeScheduledJobs from './helpers/removeScheduledJobs'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'

export default {
  type: new GraphQLNonNull(NavigateMeetingPayload),
  description: 'update a meeting by marking an item complete and setting the facilitator location',
  args: {
    completedStageId: {
      type: GraphQLID,
      description: 'The stage that the facilitator would like to mark as complete'
    },
    facilitatorStageId: {
      type: GraphQLID,
      description: 'The stage where the facilitator is'
    },
    meetingId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The meeting ID'
    }
  },
  async resolve(
    _source,
    {completedStageId, facilitatorStageId, meetingId},
    {authToken, socketId: mutatorId, dataLoader}
  ) {
    const r = await getRethink()
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    const viewerId = getUserId(authToken)
    const meeting = (await r
      .table('NewMeeting')
      .get(meetingId)
      .default(null)
      .run()) as Meeting | null
    if (!meeting) return standardError(new Error('Meeting not found'), {userId: viewerId})
    const {createdBy, facilitatorUserId, phases, teamId, meetingType} = meeting
    if (viewerId !== facilitatorUserId) {
      if (viewerId !== createdBy) {
        return standardError(new Error('Not meeting facilitator'), {userId: viewerId})
      }
      return standardError(new Error('Not meeting facilitator anymore'), {userId: viewerId})
    }

    // VALIDATION
    let phaseCompleteData
    let unlockedStageIds
    if (completedStageId) {
      const completedStageRes = findStageById(phases, completedStageId)
      if (!completedStageRes) {
        return standardError(new Error('Meeting stage not found'), {userId: viewerId})
      }
      const {stage} = completedStageRes
      if (!stage.isNavigableByFacilitator) {
        return standardError(new Error('Stage has not started'), {userId: viewerId})
      }
      if (!stage.isComplete) {
        // MUTATIVE
        stage.isComplete = true
        stage.endAt = now
        if (meetingType !== 'poker') {
          stage.readyToAdvance = stage.readyToAdvance || []
          if (!stage.readyToAdvance.includes(facilitatorUserId)) {
            stage.readyToAdvance.push(facilitatorUserId)
          }
        }
        // handle any side effects, this could mutate the meeting object!
        phaseCompleteData = await handleCompletedStage(stage, meeting, dataLoader)
        if (stage.scheduledEndTime) {
          // not critical, no await needed
          removeScheduledJobs(stage.scheduledEndTime, {meetingId}).catch(console.error)
          stage.scheduledEndTime = null
        }
      }
    }
    if (facilitatorStageId) {
      const facilitatorStageRes = findStageById(phases, facilitatorStageId)
      if (!facilitatorStageRes) {
        return standardError(new Error('Stage not found'), {userId: viewerId})
      }
      const {stage: facilitatorStage} = facilitatorStageRes
      if (!facilitatorStage.isNavigableByFacilitator) {
        return standardError(new Error('Stage has not started'), {userId: viewerId})
      }

      // mutative
      // NOTE: it is possible to start a stage then move backwards & complete another phase, which would make it seem like this phase took a long time
      // the cleanest way to fix this is to store start/stop on each stage visit, since i could visit B, then visit A, then move B before A, then visit B
      startStage_(facilitatorStage)

      // mutative! sets isNavigable and isNavigableByFacilitator
      unlockedStageIds = unlockNextStages(facilitatorStageId, phases)
    }

    // RESOLUTION
    const oldFacilitatorStageId = await r
      .table('NewMeeting')
      .get(meetingId)
      .update(
        {
          facilitatorStageId,
          phases,
          updatedAt: now
        },
        {returnChanges: true}
      )('changes')(0)('old_val')('facilitatorStageId')
      .default(null)
      .run()

    if (!oldFacilitatorStageId) {
      return {error: {message: 'Stage already advanced'}}
    }

    const data = {
      meetingId,
      oldFacilitatorStageId,
      facilitatorStageId,
      unlockedStageIds,
      ...phaseCompleteData
    }
    publish(SubscriptionChannel.TEAM, teamId, 'NavigateMeetingPayload', data, subOptions)
    return data
  }
}
