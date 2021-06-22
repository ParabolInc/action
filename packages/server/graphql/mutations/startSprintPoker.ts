import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import toTeamMemberId from '../../../client/utils/relay/toTeamMemberId'
import getRethink from '../../database/rethinkDriver'
import {MeetingTypeEnum} from '../../database/types/Meeting'
import MeetingPoker from '../../database/types/MeetingPoker'
import PokerMeetingMember from '../../database/types/PokerMeetingMember'
import getPg from '../../postgres/getPg'
import {insertTemplateRefQuery} from '../../postgres/queries/generated/insertTemplateRefQuery'
import {insertTemplateScaleRefQuery} from '../../postgres/queries/generated/insertTemplateScaleRefQuery'
import {getUserId, isTeamMember} from '../../utils/authorization'
import getHashAndJSON from '../../utils/getHashAndJSON'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {DataLoaderWorker, GQLContext} from '../graphql'
import StartSprintPokerPayload from '../types/StartSprintPokerPayload'
import createNewMeetingPhases from './helpers/createNewMeetingPhases'
import {startSlackMeeting} from './helpers/notifySlack'
import sendMeetingStartToSegment from './helpers/sendMeetingStartToSegment'
import updateTeamByTeamId from '../../postgres/queries/updateTeamByTeamId'

const freezeTemplateAsRef = async (templateId: string, dataLoader: DataLoaderWorker) => {
  const pg = getPg()
  const [template, dimensions] = await Promise.all([
    dataLoader.get('meetingTemplates').load(templateId),
    dataLoader.get('templateDimensionsByTemplateId').load(templateId)
  ])
  const {name: templateName} = template
  const uniqueScaleIds = Array.from(new Set(dimensions.map(({scaleId}) => scaleId)))
  const uniqueScales = await dataLoader.get('templateScales').loadMany(uniqueScaleIds)
  const templateScales = uniqueScales.map(({name, values}) => {
    const scale = {name, values}
    const {id, str} = getHashAndJSON(scale)
    return {id, scale: str}
  })

  const templateRef = {
    name: templateName,
    dimensions: dimensions.map((dimension) => {
      const {name, scaleId} = dimension
      const scaleIdx = uniqueScales.findIndex((scale) => scale.id === scaleId)
      const templateScale = templateScales[scaleIdx]
      const {id: scaleRefId} = templateScale
      return {
        name,
        scaleRefId
      }
    })
  }
  const {id: templateRefId, str: templateRefStr} = getHashAndJSON(templateRef)
  const ref = {id: templateRefId, template: templateRefStr}
  await Promise.all([
    insertTemplateScaleRefQuery.run({templateScales}, pg),
    insertTemplateRefQuery.run({ref}, pg)
  ])
  return templateRefId
}

export default {
  type: new GraphQLNonNull(StartSprintPokerPayload),
  description: 'Start a new sprint poker meeting',
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
    const viewerId = getUserId(authToken)
    const DUPLICATE_THRESHOLD = 3000
    // AUTH
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Not on team'), {userId: viewerId})
    }

    const meetingType = 'poker' as MeetingTypeEnum

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
    const meetingSettings = await dataLoader
      .get('meetingSettingsByType')
      .load({teamId, meetingType: 'poker'})
    const {selectedTemplateId} = meetingSettings
    const templateRefId = await freezeTemplateAsRef(selectedTemplateId, dataLoader)

    const meeting = new MeetingPoker({
      teamId,
      meetingCount,
      phases,
      facilitatorUserId: viewerId,
      templateId: selectedTemplateId,
      templateRefId
    })

    const meetingId = meeting.id
    const template = await dataLoader.get('meetingTemplates').load(selectedTemplateId)

    await r
      .table('NewMeeting')
      .insert(meeting)
      .run()

    // Disallow accidental starts (2 meetings within 2 seconds)
    const newActiveMeetings = await dataLoader.get('activeMeetingsByTeamId').load(teamId)
    const otherActiveMeeting = newActiveMeetings.find((activeMeeting) => {
      const {createdAt, id} = activeMeeting
      if (id === meetingId || activeMeeting.meetingType !== 'poker') return false
      return createdAt.getTime() > Date.now() - DUPLICATE_THRESHOLD
    })
    if (otherActiveMeeting) {
      await r
        .table('NewMeeting')
        .get(meetingId)
        .delete()
        .run()
      return {error: {message: 'Meeting already started'}}
    }

    const teamMemberId = toTeamMemberId(teamId, viewerId)
    const teamMember = await dataLoader.get('teamMembers').load(teamMemberId)
    const {isSpectatingPoker} = teamMember
    await Promise.all([
      r
        .table('MeetingMember')
        .insert(
          new PokerMeetingMember({
            meetingId,
            userId: viewerId,
            teamId,
            isSpectating: isSpectatingPoker
          })
        )
        .run(),
      r
        .table('Team')
        .get(teamId)
        .update({lastMeetingType: meetingType})
        .run(),
      updateTeamByTeamId({lastMeetingType: meetingType}, teamId)
    ])
    startSlackMeeting(meetingId, teamId, dataLoader).catch(console.log)
    sendMeetingStartToSegment(meeting, template)
    const data = {teamId, meetingId: meetingId}
    publish(SubscriptionChannel.TEAM, teamId, 'StartSprintPokerSuccess', data, subOptions)
    return data
  }
}
