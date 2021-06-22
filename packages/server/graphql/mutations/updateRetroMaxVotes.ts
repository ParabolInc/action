import {GraphQLID, GraphQLInt, GraphQLNonNull} from 'graphql'
import {MeetingSettingsThreshold, SubscriptionChannel} from 'parabol-client/types/constEnums'
import mode from 'parabol-client/utils/mode'
import isPhaseComplete from 'parabol-client/utils/meetings/isPhaseComplete'
import getRethink from '../../database/rethinkDriver'
import MeetingRetrospective from '../../database/types/MeetingRetrospective'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import UpdateRetroMaxVotesPayload from '../types/UpdateRetroMaxVotesPayload'

const updateRetroMaxVotes = {
  type: GraphQLNonNull(UpdateRetroMaxVotesPayload),
  description: `Change the max votes for participants`,
  args: {
    totalVotes: {
      type: GraphQLNonNull(GraphQLInt),
      description: 'The total number of votes for each participant'
    },
    maxVotesPerGroup: {
      type: GraphQLNonNull(GraphQLInt),
      description: 'The total number of votes for each participant to vote on a single topic'
    },
    meetingId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'the meeting to update'
    }
  },
  resolve: async (
    _source,
    {totalVotes, maxVotesPerGroup, meetingId},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const r = await getRethink()
    const viewerId = getUserId(authToken)
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    //AUTH
    const meeting = (await r
      .table('NewMeeting')
      .get(meetingId)
      .run()) as MeetingRetrospective

    if (!meeting) {
      return {error: {message: 'Meeting not found'}}
    }

    const {
      endedAt,
      meetingType,
      phases,
      teamId,
      totalVotes: oldTotalVotes,
      maxVotesPerGroup: oldMaxVotesPerGroup
    } = meeting

    if (meetingType !== 'retrospective') {
      return {error: {message: `Meeting not found`}}
    }

    if (endedAt) {
      return {error: {message: `Meeting already ended`}}
    }

    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    if (isPhaseComplete('vote', phases)) {
      return standardError(new Error('Vote phase already completed'), {userId: viewerId})
    }

    // VALIDATION
    if (
      totalVotes < maxVotesPerGroup ||
      totalVotes > MeetingSettingsThreshold.RETROSPECTIVE_TOTAL_VOTES_MAX ||
      maxVotesPerGroup < 1 ||
      maxVotesPerGroup > totalVotes
    ) {
      return standardError(new Error('Invalid max votes'), {
        userId: viewerId,
        tags: {totalVotes, maxVotesPerGroup}
      })
    }

    const delta = totalVotes - oldTotalVotes
    // this isn't 100% atomic, but it's done in a single call, so it's pretty close
    // eventual consistancy is OK, it's just possible for a client to get a bad data in between the 2 updates
    // if votesRemaining goes negative for any user, we know we can't decrease any more
    const hasError = await r
      .table('MeetingMember')
      .getAll(meetingId, {index: 'meetingId'})
      .update(
        (member) => ({
          votesRemaining: member('votesRemaining').add(delta)
        }),
        {returnChanges: true}
      )('changes')('new_val')('votesRemaining')
      .min()
      .lt(0)
      .default(false)
      .do((undo) => {
        return r.branch(
          undo,
          r
            .table('MeetingMember')
            .getAll(meetingId, {index: 'meetingId'})
            .update((member) => ({
              votesRemaining: member('votesRemaining').add(-delta)
            })),
          null
        )
      })
      .run()

    if (hasError) {
      return {error: {message: 'Your team has already spent their votes'}}
    }

    if (maxVotesPerGroup < oldMaxVotesPerGroup) {
      const reflectionGroups = await dataLoader
        .get('retroReflectionGroupsByMeetingId')
        .load(meetingId)

      const maxVotesByASingleUser = Math.max(
        ...reflectionGroups.map(({voterIds}) => mode(voterIds)[0])
      )
      if (maxVotesByASingleUser > maxVotesPerGroup) {
        return {error: {message: 'Your team has already spent their votes'}}
      }
    }

    // RESOLUTION
    await Promise.all([
      r
        .table('MeetingSettings')
        .getAll(teamId, {index: 'teamId'})
        .filter({meetingType: 'retrospective'})
        .update({
          totalVotes,
          maxVotesPerGroup
        })
        .run(),
      r
        .table('NewMeeting')
        .get(meetingId)
        .update({
          totalVotes,
          maxVotesPerGroup
        })
        .run()
    ])

    const data = {meetingId}
    publish(SubscriptionChannel.MEETING, meetingId, 'UpdateRetroMaxVotesSuccess', data, subOptions)
    return data
  }
}

export default updateRetroMaxVotes
