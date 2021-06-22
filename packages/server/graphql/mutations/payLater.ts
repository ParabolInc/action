import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import Meeting from '../../database/types/Meeting'
import db from '../../db'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import segmentIo from '../../utils/segmentIo'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import PayLaterPayload from '../types/PayLaterPayload'
import {incrementUserPayLaterClickCountQuery} from '../../postgres/queries/generated/incrementUserPayLaterClickCountQuery'
import getPg from '../../postgres/getPg'
import catchAndLog from '../../postgres/utils/catchAndLog'

export default {
  type: new GraphQLNonNull(PayLaterPayload),
  description: `Increment the count of times the org has clicked pay later`,
  args: {
    meetingId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the org that has clicked pay later'
    }
  },
  resolve: async (
    _source,
    {meetingId},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    const viewerId = getUserId(authToken)
    const meeting = (await r
      .table('NewMeeting')
      .get(meetingId)
      .run()) as Meeting | null
    if (!meeting) {
      return standardError(new Error('Invalid meeting'), {userId: viewerId})
    }
    const {teamId, showConversionModal} = meeting
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Meeting not found'), {userId: viewerId})
    }
    if (!showConversionModal) {
      return standardError(new Error('Already clicked'), {userId: viewerId})
    }

    // RESOLUTION
    const team = await dataLoader.get('teams').load(teamId)
    const {orgId} = team
    await r
      .table('Organization')
      .get(orgId)
      .update((row) => ({
        payLaterClickCount: row('payLaterClickCount')
          .default(0)
          .add(1)
      }))
      .run()
    await r
      .table('NewMeeting')
      .get(meetingId)
      .update({
        showConversionModal: false
      })
      .run()

    const reqlUpdater = (user) => ({
      payLaterClickCount: user('payLaterClickCount')
        .default(0)
        .add(1)
    })
    await Promise.all([
      catchAndLog(() => incrementUserPayLaterClickCountQuery.run({id: viewerId}, getPg())),
      db.write('User', viewerId, reqlUpdater)
    ])

    segmentIo.track({
      userId: viewerId,
      event: 'Conversion Modal Pay Later Clicked'
    })
    const data = {orgId, meetingId}
    publish(SubscriptionChannel.ORGANIZATION, orgId, 'PayLaterPayload', data, subOptions)
    return {orgId, meetingId}
  }
}
