import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import RenamePokerTemplateDimensionPayload from '../types/RenamePokerTemplateDimensionPayload'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'

const renamePokerTemplateDimension = {
  description: 'Rename a poker template dimension',
  type: new GraphQLNonNull(RenamePokerTemplateDimensionPayload),
  args: {
    dimensionId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    name: {
      type: new GraphQLNonNull(GraphQLString)
    }
  },
  async resolve(_source, {dimensionId, name}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = await getRethink()
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const dimension = await r.table('TemplateDimension').get(dimensionId).run()
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
    const trimmedName = name.trim().slice(0, 50)
    const normalizedName = trimmedName || 'Unnamed Dimension'

    const allDimensions = await r
      .table('TemplateDimension')
      .getAll(teamId, {index: 'teamId'})
      .filter({templateId})
      .filter((row) => row('removedAt').default(null).eq(null))
      .run()
    if (allDimensions.find((dimension) => dimension.name === normalizedName)) {
      return standardError(new Error('Duplicate name dimension'), {userId: viewerId})
    }

    // RESOLUTION
    await r
      .table('TemplateDimension')
      .get(dimensionId)
      .update({
        name: normalizedName,
        updatedAt: now
      })
      .run()

    const data = {dimensionId}
    publish(
      SubscriptionChannel.TEAM,
      teamId,
      'RenamePokerTemplateDimensionPayload',
      data,
      subOptions
    )
    return data
  }
}

export default renamePokerTemplateDimension
