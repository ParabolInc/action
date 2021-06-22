import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import findStageById from 'parabol-client/utils/meetings/findStageById'
import getRethink from '../../database/rethinkDriver'
import GenericMeetingPhase, {
  NewMeetingPhaseTypeEnum
} from '../../database/types/GenericMeetingPhase'
import GenericMeetingStage from '../../database/types/GenericMeetingStage'
import {getUserId} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import ResetMeetingToStagePayload from '../types/ResetMeetingToStagePayload'
import createNewMeetingPhases, {primePhases} from './helpers/createNewMeetingPhases'

const resetMeetingToStage = {
  type: GraphQLNonNull(ResetMeetingToStagePayload),
  description: `Reset meeting to a previously completed stage`,
  args: {
    meetingId: {
      type: GraphQLNonNull(GraphQLID)
    },
    stageId: {
      type: GraphQLNonNull(GraphQLID)
    }
  },
  resolve: async (_source, {meetingId, stageId}, {authToken, socketId: mutatorId, dataLoader}) => {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    const viewerId = getUserId(authToken)
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    if (!meeting) return standardError(new Error('Meeting not found'), {userId: viewerId})
    const {createdBy, facilitatorUserId, phases, teamId, meetingType, meetingCount} = meeting
    if (viewerId !== facilitatorUserId) {
      if (viewerId !== createdBy)
        return standardError(new Error('Not meeting facilitator'), {userId: viewerId})
      return standardError(new Error('Not meeting facilitator anymore'), {userId: viewerId})
    }

    // VALIDATION
    const foundResponse = findStageById(phases, stageId)
    if (!foundResponse)
      return standardError(new Error('Meeting stage not found'), {userId: viewerId})
    const {stage: resetToStage} = foundResponse
    if (!resetToStage.isNavigableByFacilitator)
      return standardError(new Error('Stage has not started'), {userId: viewerId})
    if (!resetToStage.isComplete)
      return standardError(new Error('Stage has not finished'), {userId: viewerId})
    if ((resetToStage.phaseType as NewMeetingPhaseTypeEnum) !== 'group')
      return standardError(new Error('Resetting to this stage type is not supported'), {
        userId: viewerId
      })
    if (meeting.endedAt)
      return standardError(new Error('The meeting has already ended'), {userId: viewerId})

    // RESOLUTION
    // TODO don't create all the phases from scratch
    const createdPhases = await createNewMeetingPhases(
      viewerId,
      teamId,
      meetingCount,
      meetingType,
      dataLoader
    )
    let shouldResetStage = false
    let resetToPhaseIndex = -1
    const newPhases = [] as GenericMeetingPhase[]
    for (const [phaseIndex, phase] of phases.entries()) {
      const {stages} = phase
      if (!stages) continue
      const newStages = [] as GenericMeetingStage[]
      for (const [stageIndex, stage] of stages.entries()) {
        if (stage.id === stageId) {
          shouldResetStage = true
          resetToPhaseIndex = phaseIndex
        }
        if (!shouldResetStage) {
          newStages.push(stage)
          continue
        }
        const resettedStage = createdPhases[phaseIndex]?.stages[stageIndex]
        if (!resettedStage) continue
        newStages.push(Object.assign(resettedStage, {id: stage.id}))
      }
      phase.stages = newStages
      newPhases.push(phase)
    }
    primePhases(newPhases, resetToPhaseIndex)

    const reflectionGroups = await dataLoader
      .get('retroReflectionGroupsByMeetingId')
      .load(meetingId)
    const reflectionGroupIds = reflectionGroups.map((rg) => rg.id)
    // bc we return the reflection groups cached by data loader in the fragment
    reflectionGroups.forEach((rg) => (rg.voterIds = []))

    await Promise.all([
      r
        .table('Comment')
        .getAll(r.args(reflectionGroupIds), {index: 'threadId'})
        .delete()
        .run(),
      r
        .table('Task')
        .getAll(r.args(reflectionGroupIds), {index: 'threadId'})
        .delete()
        .run(),
      r
        .table('RetroReflectionGroup')
        .getAll(r.args(reflectionGroupIds))
        .update({voterIds: []})
        .run(),
      r
        .table('NewMeeting')
        .get(meetingId)
        .update({phases: newPhases})
        .run(),
      (r.table('MeetingMember').getAll(meetingId, {index: 'meetingId'}) as any)
        .update({votesRemaining: meeting.totalVotes})
        .run()
    ])
    const data = {
      meetingId
    }
    publish(SubscriptionChannel.MEETING, meetingId, 'ResetMeetingToStagePayload', data, subOptions)
    return data
  }
}

export default resetMeetingToStage
