import {GraphQLBoolean, GraphQLNonNull, GraphQLString} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {NewMeetingPhaseTypeEnum} from '../../database/types/GenericMeetingPhase'
import {getUserId, isTeamMember, isUserBillingLeader} from '../../utils/authorization'
import segmentIo from '../../utils/segmentIo'
import standardError from '../../utils/standardError'
import {DataLoaderWorker} from '../graphql'
import SegmentEventTrackOptions from '../types/SegmentEventTrackOptions'

const extraOptionsCreator = {
  HelpMenuOpen: async (
    viewerId: string,
    _dataLoader: DataLoaderWorker,
    _options: Record<string, unknown>
  ) => {
    const r = await getRethink()
    const meetingCount = await r
      .table('MeetingMember')
      .getAll(viewerId, {index: 'userId'})
      .count()
      .run()
    return {
      meetingCount
    }
  }
}

type SegmentEventTrackOptions = {
  teamId?: string | null
  orgId?: string | null
  phase?: NewMeetingPhaseTypeEnum | null
  eventId?: number | null
  actionType?: string | null
}
type SendClientSegmentEventMutationVariables = {
  event: string
  options?: SegmentEventTrackOptions | null
}

export default {
  name: 'SegmentEventTrack',
  description: 'track an event in segment, like when errors are hit',
  type: GraphQLBoolean,
  args: {
    event: {
      type: GraphQLNonNull(GraphQLString)
    },
    options: {
      type: SegmentEventTrackOptions
    }
  },
  resolve: async (
    _source,
    {event, options}: SendClientSegmentEventMutationVariables,
    {authToken, dataLoader}
  ) => {
    // AUTH
    const viewerId = getUserId(authToken)
    const {teamId, orgId} = options || {teamId: undefined, orgId: undefined}
    // const {teamId, orgId} = options || {}
    if (teamId) {
      // fail silently. they're being sneaky
      if (!isTeamMember(authToken, teamId)) {
        standardError(new Error('Failed input validation'), {userId: viewerId})
        return false
      }
    }
    if (orgId) {
      if (!(await isUserBillingLeader(viewerId, orgId, dataLoader))) {
        standardError(new Error('Failed input validation'), {userId: viewerId})
        return false
      }
    }

    // RESOLUTION
    const getExtraOptions = extraOptionsCreator[event]
    const extraOptions = getExtraOptions ? await getExtraOptions(viewerId, dataLoader, options) : {}
    segmentIo.track({
      userId: viewerId,
      event,
      properties: {
        ...options,
        ...extraOptions
      }
    })
    return true
  }
}
