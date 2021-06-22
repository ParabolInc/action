import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import UpdatePokerTemplateDimensionScalePayload from '../types/UpdatePokerTemplateDimensionScalePayload'

const updatePokerTemplateDimensionScale = {
  description: 'Update the scale used for a dimension in a template',
  type: new GraphQLNonNull(UpdatePokerTemplateDimensionScalePayload),
  args: {
    dimensionId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    scaleId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  async resolve(_source, {dimensionId, scaleId}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = await getRethink()
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const dimension = await r.table('TemplateDimension').get(dimensionId).run()
    const viewerId = getUserId(authToken)
    const teamId = dimension.teamId

    // AUTH
    if (!dimension || dimension.removedAt) {
      return standardError(new Error('Dimension not found'), {userId: viewerId})
    }
    if (!isTeamMember(authToken, dimension.teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // VALIDATION
    const scale = await r.table('TemplateScale').get(scaleId).run()
    if (!scale || scale.removedAt || (!scale.isStarter && scale.teamId !== teamId)) {
      return standardError(new Error('Scale not found'), {userId: viewerId})
    }

    await r.table('TemplateDimension').get(dimensionId).update({scaleId, updatedAt: now}).run()

    const data = {dimensionId}
    publish(
      SubscriptionChannel.TEAM,
      teamId,
      'UpdatePokerTemplateDimensionScalePayload',
      data,
      subOptions
    )
    return data
  }
}

export default updatePokerTemplateDimensionScale
