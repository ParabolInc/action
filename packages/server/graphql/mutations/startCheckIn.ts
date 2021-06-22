import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import ActionMeetingMember from '../../database/types/ActionMeetingMember'
import {MeetingTypeEnum} from '../../database/types/Meeting'
import MeetingAction from '../../database/types/MeetingAction'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import StartCheckInPayload from '../types/StartCheckInPayload'
import createNewMeetingPhases from './helpers/createNewMeetingPhases'
import {startSlackMeeting} from './helpers/notifySlack'
import sendMeetingStartToSegment from './helpers/sendMeetingStartToSegment'
import updateTeamByTeamId from '../../postgres/queries/updateTeamByTeamId'

export default {
  type: new GraphQLNonNull(StartCheckInPayload),
  description: 'Start a new meeting',
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The team starting the meeting'
    }
  },
  async resolve(
    _source,
    {teamId}: {teamId: string},
    {authToken, socketId: mutatorId, dataLoader}: GQLContext
  ) {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    // AUTH
    const viewerId = getUserId(authToken)
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    const meetingType = 'action' as MeetingTypeEnum

    // RESOLUTION
    const meetingCount = await r
      .table('NewMeeting')
      .getAll(teamId, {index: 'teamId'})
      .filter({meetingType})
      .count()
      .default(0)
      .run()

    const phases = await createNewMeetingPhases(
      viewerId,
      teamId,
      meetingCount,
      meetingType,
      dataLoader
    )
    const meeting = new MeetingAction({
      teamId,
      meetingCount,
      phases,
      facilitatorUserId: viewerId
    })
    const {id: meetingId} = meeting
    await r
      .table('NewMeeting')
      .insert(meeting)
      .run()

    // Disallow accidental starts (2 meetings within 2 seconds)
    const newActiveMeetings = await dataLoader.get('activeMeetingsByTeamId').load(teamId)
    const otherActiveMeeting = newActiveMeetings.find((activeMeeting) => {
      const {id} = activeMeeting
      if (id === meetingId || activeMeeting.meetingType !== meetingType) return false
      return true
    })
    if (otherActiveMeeting) {
      await r
        .table('NewMeeting')
        .get(meetingId)
        .delete()
        .run()
      return {error: {message: 'Meeting already started'}}
    }
    const agendaItems = await dataLoader.get('agendaItemsByTeamId').load(teamId)
    const agendaItemIds = agendaItems.map(({id}) => id)

    await Promise.all([
      r
        .table('MeetingMember')
        .insert(new ActionMeetingMember({meetingId, userId: viewerId, teamId}))
        .run(),
      r
        .table('Team')
        .get(teamId)
        .update({lastMeetingType: meetingType})
        .run(),
      updateTeamByTeamId({lastMeetingType: meetingType}, teamId),
      r
        .table('AgendaItem')
        .getAll(r.args(agendaItemIds))
        .update({meetingId})
        .run()
    ])

    startSlackMeeting(meetingId, teamId, dataLoader).catch(console.log)
    sendMeetingStartToSegment(meeting)
    const data = {teamId, meetingId}
    publish(SubscriptionChannel.TEAM, teamId, 'StartCheckInSuccess', data, subOptions)
    return data
  }
}
