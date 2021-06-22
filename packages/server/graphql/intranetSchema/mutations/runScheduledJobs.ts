import {GraphQLInt, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../../database/rethinkDriver'
import Meeting from '../../../database/types/Meeting'
import NotificationMeetingStageTimeLimitEnd from '../../../database/types/NotificationMeetingStageTimeLimitEnd'
import ScheduledJob from '../../../database/types/ScheduledJob'
import ScheduledJobMeetingStageTimeLimit from '../../../database/types/ScheduledJobMetingStageTimeLimit'
import SlackAuth from '../../../database/types/SlackAuth'
import SlackNotification from '../../../database/types/SlackNotification'
import {requireSU} from '../../../utils/authorization'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import publish from '../../../utils/publish'
import SlackServerManager from '../../../utils/SlackServerManager'
import appOrigin from '../../../appOrigin'

const processMeetingStageTimeLimits = async (job: ScheduledJobMeetingStageTimeLimit) => {
  const r = await getRethink()
  const {meetingId} = job
  const meeting = (await r
    .table('NewMeeting')
    .get(meetingId)
    .run()) as Meeting
  const {teamId, facilitatorUserId} = meeting
  const {slackNotification, slackAuth} = await r({
    slackNotification: (r
      .table('SlackNotification')
      .getAll(facilitatorUserId, {index: 'userId'})
      .filter({teamId, event: 'MEETING_STAGE_TIME_LIMIT_END'})
      .nth(0)
      .default(null) as unknown) as SlackNotification,
    slackAuth: (r
      .table('SlackAuth')
      .getAll(facilitatorUserId, {index: 'userId'})
      .filter({teamId})
      .nth(0)
      .default(null) as unknown) as SlackAuth
  }).run()

  let sendViaSlack = Boolean(slackAuth?.botAccessToken && slackNotification?.channelId)
  if (sendViaSlack) {
    const {channelId} = slackNotification
    if (!channelId) {
      sendViaSlack = false
    } else {
      const {botAccessToken} = slackAuth
      const manager = new SlackServerManager(botAccessToken)
      const meetingUrl = makeAppURL(appOrigin, `meet/${meetingId}`)
      const slackText = `Time’s up! Advance your meeting to the next phase: ${meetingUrl}`
      const res = await manager.postMessage(channelId, slackText)
      if (!res.ok) {
        sendViaSlack = false
      }
    }
  }
  if (!sendViaSlack) {
    const notification = new NotificationMeetingStageTimeLimitEnd({
      meetingId,
      userId: facilitatorUserId
    })
    await r
      .table('Notification')
      .insert(notification)
      .run()
    publish(SubscriptionChannel.NOTIFICATION, facilitatorUserId, 'MeetingStageTimeLimitPayload', {
      notification
    })
  }

  // get the meeting
  // get the facilitator
  // see if the facilitator has turned on slack notifications for the meeting
  // if so, send the facilitator a slack notification
  // if not, send the facilitator an in-app notification
}

const jobProcessors = {
  MEETING_STAGE_TIME_LIMIT_END: processMeetingStageTimeLimits
}

const processJob = async (job: ScheduledJob) => {
  const r = await getRethink()
  const res = await r
    .table('ScheduledJob')
    .get(job.id)
    .delete()
    .run()
  // prevent duplicates. after this point, we assume the job finishes to completion (ignores server crashes, etc.)
  if (res.deleted !== 1) return
  const processor = jobProcessors[job.type]
  processor(job as any).catch(console.log)
}

const runScheduledJobs = {
  type: GraphQLInt,
  description: 'schedule upcoming jobs to be run',
  args: {
    seconds: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'Queue up all jobs that are scheduled to run within this many seconds'
    }
    // type: {
    //   type: GraphQLString,
    //   description: 'filter jobs by their type'
    // }
  },
  resolve: async (_source, {seconds}, {authToken}) => {
    const r = await getRethink()
    const now = new Date()
    // AUTH
    requireSU(authToken)

    // RESOLUTION
    const before = new Date(now.getTime() + seconds * 1000)
    const upcomingJobs = await r
      .table('ScheduledJob')
      .between(r.minval, before, {index: 'runAt'})
      .run()

    upcomingJobs.forEach((job) => {
      const {runAt} = job
      const timeout = Math.max(0, runAt.getTime() - now.getTime())
      setTimeout(() => {
        processJob(job).catch(console.log)
      }, timeout)
    })

    return upcomingJobs.length
  }
}

export default runScheduledJobs
