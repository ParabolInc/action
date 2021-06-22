import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import TimelineEventCheckinComplete from 'parabol-server/database/types/TimelineEventCheckinComplete'
import TimelineEventRetroComplete from 'parabol-server/database/types/TimelineEventRetroComplete'
import getRethink from '../../database/rethinkDriver'
import {TimelineEventEnum} from '../../database/types/TimelineEvent'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import ArchiveTimelineEventPayload from '../types/ArchiveTimelineEventPayload'

const archiveTimelineEvent = {
  type: GraphQLNonNull(ArchiveTimelineEventPayload),
  description: `Archive a timeline event`,
  args: {
    timelineEventId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'the id for the timeline event'
    }
  },
  resolve: async (
    _source,
    {timelineEventId},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const viewerId = getUserId(authToken)

    // VALIDATION
    const timelineEvent = await dataLoader.get('timelineEvents').load(timelineEventId)
    if (!timelineEvent) {
      return {error: {message: 'Timeline Event not found'}}
    }

    const {isActive, type} = timelineEvent
    if (!isActive) {
      return {error: {message: 'Timeline Event not found'}}
    }

    const meetingTypes: TimelineEventEnum[] = ['actionComplete', 'retroComplete']
    if (meetingTypes.includes(type)) {
      // it's a meeting timeline event, archive it for everyone
      const {teamId, meetingId} = timelineEvent as
        | TimelineEventRetroComplete
        | TimelineEventCheckinComplete
      if (!isTeamMember(authToken, teamId)) {
        return standardError(new Error('Team not found'), {userId: viewerId})
      }
      const meetingTimelineEvents = await dataLoader
        .get('timelineEventsByMeetingId')
        .load(meetingId)
      const eventIds = meetingTimelineEvents.map(({id}) => id)
      await r
        .table('TimelineEvent')
        .getAll(r.args(eventIds))
        .update({isActive: false})
        .run()
      meetingTimelineEvents.map((event) => {
        const {id: timelineEventId, userId} = event
        publish(
          SubscriptionChannel.NOTIFICATION,
          userId,
          'ArchiveTimelineEventSuccess',
          {timelineEventId},
          subOptions
        )
      })
    }
    return {timelineEventId}
  }
}

export default archiveTimelineEvent
