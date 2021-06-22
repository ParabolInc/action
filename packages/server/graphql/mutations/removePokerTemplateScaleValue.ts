import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import RemovePokerTemplateScaleValuePayload from '../types/RemovePokerTemplateScaleValuePayload'

const removePokerTemplateScaleValue = {
  description: 'Remove a scale value from the scale of a template',
  type: new GraphQLNonNull(RemovePokerTemplateScaleValuePayload),
  args: {
    scaleId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    label: {
      type: new GraphQLNonNull(GraphQLString)
    }
  },
  async resolve(_source, {scaleId, label}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = await getRethink()
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const viewerId = getUserId(authToken)

    // AUTH
    const scale = await r
      .table('TemplateScale')
      .get(scaleId)
      .run()
    if (!scale || scale.removedAt) {
      return standardError(new Error('Did not find an active scale'), {userId: viewerId})
    }
    if (!isTeamMember(authToken, scale.teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }
    const {values: oldScaleValues} = scale
    const oldScaleValue = oldScaleValues.find((oldScaleValue) => oldScaleValue.label === label)

    // VALIDATION
    if (!oldScaleValue) {
      return standardError(new Error('Did not find an old scale value to remove'), {
        userId: viewerId
      })
    }

    // RESOLUTION
    await r
      .table('TemplateScale')
      .get(scaleId)
      .update((row) => ({
        values: row('values').deleteAt(
          row('values')
            .offsetsOf(oldScaleValue)
            .nth(0)
        ),
        updatedAt: now
      }))
      .run()

    const data = {scaleId}
    publish(
      SubscriptionChannel.TEAM,
      scale.teamId,
      'RemovePokerTemplateScalePayload',
      data,
      subOptions
    )
    return data
  }
}

export default removePokerTemplateScaleValue
