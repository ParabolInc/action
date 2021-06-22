import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import {getUserId} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import SetCheckInEnabledPayload from '../types/SetCheckInEnabledPayload'

const setCheckInEnabled = {
  type: GraphQLNonNull(SetCheckInEnabledPayload),
  description: 'Enabled or disable the icebreaker round',
  args: {
    settingsId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    isEnabled: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true to turn icebreaker phase on, false to turn it off'
    }
  },
  resolve: async (
    _source,
    {settingsId, isEnabled},
    {authToken, dataLoader, socketId: mutatorId}
  ) => {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}

    // AUTH
    const viewerId = getUserId(authToken)
    const settings = await r
      .table('MeetingSettings')
      .get(settingsId)
      .run()
    if (!settings) {
      return standardError(new Error('Settings not found'), {userId: viewerId})
    }
    const {teamId} = settings
    // RESOLUTION
    await r
      .table('MeetingSettings')
      .get(settingsId)
      .update((row) => ({
        phaseTypes: r.branch(
          row('phaseTypes').contains('checkin'),
          isEnabled ? row('phaseTypes') : row('phaseTypes').difference(['checkin']),
          isEnabled ? row('phaseTypes').prepend('checkin') : row('phaseTypes')
        )
      }))
      .run()

    const data = {settingsId}
    publish(SubscriptionChannel.TEAM, teamId, 'SetCheckInEnabledPayload', data, subOptions)
    return data
  }
}

export default setCheckInEnabled
