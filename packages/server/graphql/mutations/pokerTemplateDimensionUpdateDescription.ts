import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import PokerTemplateDimensionUpdateDescriptionPayload from '../types/PokerTemplateDimensionUpdateDescriptionPayload'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'

const pokerTemplateDimensionUpdateDescription = {
  description: 'Update the description of a poker template dimension',
  type: PokerTemplateDimensionUpdateDescriptionPayload,
  args: {
    dimensionId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    description: {
      type: new GraphQLNonNull(GraphQLString)
    }
  },
  async resolve(_source, {dimensionId, description}, {authToken, dataLoader, socketId: mutatorId}) {
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
    const {teamId} = dimension
    const normalizedDescription = description.trim().slice(0, 256) || ''

    // RESOLUTION
    await r
      .table('TemplateDimension')
      .get(dimensionId)
      .update({
        description: normalizedDescription,
        updatedAt: now
      })
      .run()

    const data = {dimensionId}
    publish(
      SubscriptionChannel.TEAM,
      teamId,
      'PokerTemplateDimensionUpdateDescriptionPayload',
      data,
      subOptions
    )
    return data
  }
}

export default pokerTemplateDimensionUpdateDescription
