import {GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLString} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import MovePokerTemplateScaleValuePayload from '../types/MovePokerTemplateScaleValuePayload'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {GQLContext} from '../graphql'
import standardError from '../../utils/standardError'

const movePokerTemplateScaleValue = {
  type: GraphQLNonNull(MovePokerTemplateScaleValuePayload),
  description: `Move a scale value to an index`,
  args: {
    scaleId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    label: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The label of the moving scale value'
    },
    index: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The index position where the scale value is moving to'
    }
  },
  resolve: async (
    _source,
    {scaleId, label, index},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const r = await getRethink()
    const viewerId = getUserId(authToken)
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const scale = await r
      .table('TemplateScale')
      .get(scaleId)
      .run()

    //AUTH
    if (!scale || scale.removedAt) {
      return standardError(new Error('Did not find an active scale'), {userId: viewerId})
    }
    if (!isTeamMember(authToken, scale.teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // VALIDATION
    if (index < 0 || index >= scale.values.length - 2) {
      return standardError(new Error('Invalid index to move to'), {userId: viewerId})
    }
    const scaleValueIndex = scale.values.findIndex((scaleValue) => scaleValue.label === label)
    if (scaleValueIndex == -1) {
      return standardError(new Error('Did not find an existing scale value to move'), {
        userId: viewerId
      })
    }

    // RESOLUTION
    await r
      .table('TemplateScale')
      .get(scaleId)
      .update((row) => ({
        values: row('values')
          .deleteAt(scaleValueIndex)
          .insertAt(index, scale.values[scaleValueIndex]),
        updatedAt: now
      }))
      .run()

    const data = {scaleId}
    publish(
      SubscriptionChannel.TEAM,
      scale.teamId,
      'MovePokerTemplateScaleValueSuccess',
      data,
      subOptions
    )
    return data
  }
}

export default movePokerTemplateScaleValue
