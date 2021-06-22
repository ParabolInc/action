import ms from 'ms'
import {Unpromise} from 'parabol-client/types/generics'
import formatTime from 'parabol-client/utils/date/formatTime'
import formatWeekday from 'parabol-client/utils/date/formatWeekday'
import findStageById from 'parabol-client/utils/meetings/findStageById'
import {phaseLabelLookup} from 'parabol-client/utils/meetings/lookups'
import getRethink from '../../../database/rethinkDriver'
import SlackAuth from '../../../database/types/SlackAuth'
import SlackNotification, {SlackNotificationEvent} from '../../../database/types/SlackNotification'
import {toEpochSeconds} from '../../../utils/epochTime'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import segmentIo from '../../../utils/segmentIo'
import sendToSentry from '../../../utils/sendToSentry'
import SlackServerManager from '../../../utils/SlackServerManager'
import errorFilter from '../../errorFilter'
import {DataLoaderWorker} from '../../graphql'
import appOrigin from '../../../appOrigin'

const getSlackDetails = async (
  event: SlackNotificationEvent,
  teamId: string,
  dataLoader: DataLoaderWorker
) => {
  const notificationsByTeamId = await dataLoader.get('slackNotificationsByTeamId').load(teamId)
  const notifications = notificationsByTeamId.filter((notification) => notification.event === event)
  const usedChannelIds = new Set()
  const distinctChannelNotifications = [] as SlackNotification[]
  for (let ii = 0; ii < notifications.length; ii++) {
    const notification = notifications[ii]
    const {channelId} = notification
    if (!channelId || usedChannelIds.has(channelId)) continue
    usedChannelIds.add(channelId)
    distinctChannelNotifications.push(notification)
  }
  const notificationUserIds = distinctChannelNotifications.map(({userId}) => userId)
  const userSlackAuths = (
    await dataLoader.get('slackAuthByUserId').loadMany(notificationUserIds)
  ).filter(errorFilter)
  return userSlackAuths.map((userSlackAuthArr, idx) => {
    const auth = userSlackAuthArr.find((val) => val.teamId === teamId) as SlackAuth
    return {auth, notification: distinctChannelNotifications[idx]}
  })
}

/* eslint-disable no-await-in-loop */
const notifySlack = async (
  event: SlackNotificationEvent,
  dataLoader: DataLoaderWorker,
  teamId: string,
  slackText: string
) => {
  const r = await getRethink()
  const slackDetails = await getSlackDetails(event, teamId, dataLoader)
  // for each slack channel, send a notification
  for (let i = 0; i < slackDetails.length; i++) {
    const {notification, auth} = slackDetails[i]
    const {channelId} = notification
    const {botAccessToken, userId} = auth
    const manager = new SlackServerManager(botAccessToken)
    const res = await manager.postMessage(channelId!, slackText)
    segmentIo.track({
      userId,
      event: 'Slack notification sent',
      properties: {
        teamId,
        notificationEvent: event
      }
    })
    if ('error' in res) {
      const {error} = res
      if (error === 'channel_not_found') {
        await r
          .table('SlackNotification')
          .getAll(teamId, {index: 'teamId'})
          .filter({channelId})
          .update({
            channelId: null
          })
          .run()
      } else if (error === 'not_in_channel' || error === 'invalid_auth') {
        sendToSentry(
          new Error(`Slack Channel Notification Error: ${teamId}, ${channelId}, ${auth.id}`)
        )
      }
    }
  }
}

export const startSlackMeeting = async (
  meetingId: string,
  teamId: string,
  dataLoader: DataLoaderWorker
) => {
  const searchParams = {
    utm_source: 'slack meeting start',
    utm_medium: 'product',
    utm_campaign: 'invitations'
  }
  const options = {searchParams}
  const team = await dataLoader.get('teams').load(teamId)

  const meetingUrl = makeAppURL(appOrigin, `meet/${meetingId}`, options)
  const slackText = `${team.name} has started a meeting!\n To join, click here: ${meetingUrl}`
  notifySlack('meetingStart', dataLoader, teamId, slackText).catch(console.log)
}

export const endSlackMeeting = async (meetingId, teamId, dataLoader: DataLoaderWorker) => {
  const searchParams = {
    utm_source: 'slack summary',
    utm_medium: 'product',
    utm_campaign: 'after-meeting'
  }
  const options = {searchParams}
  const team = await dataLoader.get('teams').load(teamId)
  const summaryUrl = makeAppURL(appOrigin, `new-summary/${meetingId}`, options)
  const slackText = `The meeting for ${team.name} has ended!\n Check out the summary here: ${summaryUrl}`
  notifySlack('meetingEnd', dataLoader, teamId, slackText).catch(console.log)
}

const upsertSlackMessage = async (
  slackDetails: Unpromise<ReturnType<typeof getSlackDetails>>[0],
  slackText: string
) => {
  const {notification, auth} = slackDetails
  const {channelId} = notification
  const {botAccessToken} = auth
  if (!channelId) return
  const manager = new SlackServerManager(botAccessToken)
  const convoInfo = await manager.getConversationInfo(channelId)
  if (convoInfo.ok && 'latest' in convoInfo.channel) {
    const {channel} = convoInfo
    const {latest} = channel
    if (latest) {
      const {ts, bot_profile} = latest
      const {name} = bot_profile
      if (name === 'Parabol') {
        const timestamp = new Date(Number.parseFloat(ts) * 1000)
        const ageThresh = new Date(Date.now() - ms('5m'))
        if (timestamp >= ageThresh) {
          // trigger update
          const res = await manager.updateMessage(channelId, slackText, ts)
          if (!res.ok) {
            console.error(res.error)
          }
          return
        }
      }
    }
  } else {
    // handle error?
  }
  const res = await manager.postMessage(channelId, slackText)
  if (!res.ok) {
    console.error(res.error)
  }
}

export const notifySlackTimeLimitStart = async (
  scheduledEndTime: Date,
  meetingId: string,
  teamId: string,
  dataLoader: DataLoaderWorker
) => {
  const [team, meeting] = await Promise.all([
    dataLoader.get('teams').load(teamId),
    dataLoader.get('newMeetings').load(meetingId)
  ])
  const {name: meetingName, phases, facilitatorStageId} = meeting
  const stageRes = findStageById(phases, facilitatorStageId)
  const {stage} = stageRes!
  const meetingUrl = makeAppURL(appOrigin, `meet/${meetingId}`)
  const {phaseType} = stage
  const phaseLabel = phaseLabelLookup[phaseType]
  const slackDetails = await getSlackDetails('MEETING_STAGE_TIME_LIMIT_START', teamId, dataLoader)
  slackDetails.forEach(async (slackDetail) => {
    const fallbackDate = formatWeekday(scheduledEndTime)
    const fallbackTime = formatTime(scheduledEndTime)
    const fallbackZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Eastern Time'
    const fallback = `${fallbackDate} at ${fallbackTime} (${fallbackZone})`
    const situation = `The *${phaseLabel} Phase* for ${meetingName} on ${team.name} has begun!`.replace(
      '#',
      ''
    )
    const constraint = `You have until *<!date^${toEpochSeconds(
      scheduledEndTime
    )}^{date_short_pretty} at {time}|${fallback}>* to complete it.`
    const cta = `Check it out: ${meetingUrl}`
    const slackText = [situation, constraint, cta].join('\n')
    upsertSlackMessage(slackDetail, slackText).catch(console.error)
  })
}
