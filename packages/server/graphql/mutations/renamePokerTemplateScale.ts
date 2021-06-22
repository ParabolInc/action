import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import RenamePokerTemplateScalePayload from '../types/RenamePokerTemplateScalePayload'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'

const renamePokerTemplateScale = {
  description: 'Rename a poker template scale',
  type: new GraphQLNonNull(RenamePokerTemplateScalePayload),
  args: {
    scaleId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    name: {
      type: new GraphQLNonNull(GraphQLString)
    }
  },
  async resolve(_source, {scaleId, name}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = await getRethink()
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const scale = await r.table('TemplateScale').get(scaleId).run()
    const viewerId = getUserId(authToken)

    // AUTH
    if (!scale || scale.removedAt) {
      return standardError(new Error('Scale not found'), {userId: viewerId})
    }
    if (!isTeamMember(authToken, scale.teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // VALIDATION
    const {teamId} = scale
    const trimmedName = name.trim().slice(0, 50)
    const normalizedName = trimmedName || 'Unnamed Scale'

    const allScales = await r
      .table('TemplateScale')
      .getAll(teamId, {index: 'teamId'})
      .filter((row) => row('removedAt').default(null).eq(null))
      .run()
    if (allScales.find((scale) => scale.name === normalizedName)) {
      return standardError(new Error('Duplicate name scale'), {userId: viewerId})
    }

    // RESOLUTION
    await r
      .table('TemplateScale')
      .get(scaleId)
      .update({
        name: normalizedName,
        updatedAt: now
      })
      .run()

    const data = {scaleId}
    publish(SubscriptionChannel.TEAM, teamId, 'RenamePokerTemplateScalePayload', data, subOptions)
    return data
  }
}

export default renamePokerTemplateScale
