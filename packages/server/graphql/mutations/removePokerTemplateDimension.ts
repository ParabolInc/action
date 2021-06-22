import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import RemovePokerTemplateDimensionPayload from '../types/RemovePokerTemplateDimensionPayload'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'

const removePokerTemplateDimension = {
  description: 'Remove a dimension from a template',
  type: new GraphQLNonNull(RemovePokerTemplateDimensionPayload),
  args: {
    dimensionId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  async resolve(_source, {dimensionId}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = await getRethink()
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const dimension = await r
      .table('TemplateDimension')
      .get(dimensionId)
      .run()
    const viewerId = getUserId(authToken)

    // AUTH
    if (!dimension || dimension.removedAt) {
      return standardError(new Error('Dimension not found'), {userId: viewerId})
    }
    if (!isTeamMember(authToken, dimension.teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // VALIDATION
    const {teamId, templateId} = dimension
    const dimensionCount = await r
      .table('TemplateDimension')
      .getAll(teamId, {index: 'teamId'})
      .filter({templateId})
      .filter((row) =>
        row('removedAt')
          .default(null)
          .eq(null)
      )
      .count()
      .default(0)
      .run()

    if (dimensionCount <= 1) {
      return standardError(new Error('No dimensions remain'), {userId: viewerId})
    }

    // RESOLUTION
    await r
      .table('TemplateDimension')
      .get(dimensionId)
      .update({removedAt: now})
      .run()

    const data = {dimensionId, templateId}
    publish(
      SubscriptionChannel.TEAM,
      teamId,
      'RemovePokerTemplateDimensionPayload',
      data,
      subOptions
    )
    return data
  }
}

export default removePokerTemplateDimension
