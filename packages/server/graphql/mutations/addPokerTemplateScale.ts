import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel, Threshold} from 'parabol-client/types/constEnums'
import dndNoise from 'parabol-client/utils/dndNoise'
import getRethink from '../../database/rethinkDriver'
import TemplateScale from '../../database/types/TemplateScale'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import AddPokerTemplateScalePayload from '../types/AddPokerTemplateScalePayload'
import sendScaleEventToSegment from './helpers/sendScaleEventToSegment'

const addPokerTemplateScale = {
  description: 'Add a new scale for the poker template',
  type: new GraphQLNonNull(AddPokerTemplateScalePayload),
  args: {
    parentScaleId: {
      type: GraphQLID
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  async resolve(_source, {parentScaleId, teamId}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const viewerId = getUserId(authToken)

    // AUTH
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // VALIDATION
    const activeScales = await r
      .table('TemplateScale')
      .getAll(teamId, {index: 'teamId'})
      .filter((row) => row('removedAt').default(null).eq(null))
      .run()
    if (activeScales.length >= Threshold.MAX_POKER_TEMPLATE_SCALES) {
      return standardError(new Error('Too many scales'), {userId: viewerId})
    }

    // RESOLUTION
    let newScale
    const sortOrder = Math.max(0, ...activeScales.map((scale) => scale.sortOrder)) + 1 + dndNoise()
    if (parentScaleId) {
      const parentScale = (await dataLoader
        .get('templateScales')
        .load(parentScaleId)) as TemplateScale
      if (!parentScale) {
        return standardError(new Error('Parent scale not found'), {userId: viewerId})
      }
      if (!parentScale.isStarter && parentScale.teamId !== teamId) {
        return standardError(new Error('Cannot copy from a scale not owned by the team'), {
          userId: viewerId
        })
      }
      const {name} = parentScale
      const copyName = `${name} Copy`
      const existingCopyCount = await r
        .table('TemplateScale')
        .getAll(teamId, {index: 'teamId'})
        .filter((row) => row('removedAt').default(null).eq(null))
        .filter((row) => row('name').match(`^${copyName}`) as any)
        .count()
        .run()
      const newName = existingCopyCount === 0 ? copyName : `${copyName} #${existingCopyCount + 1}`
      newScale = new TemplateScale({
        sortOrder,
        name: newName,
        teamId,
        parentScaleId,
        values: parentScale.values
      })
    } else {
      newScale = new TemplateScale({
        sortOrder,
        name: `*New Scale #${activeScales.length + 1}`,
        teamId
      })
    }

    await r.table('TemplateScale').insert(newScale).run()

    const scaleId = newScale.id
    const data = {scaleId}
    sendScaleEventToSegment(viewerId, newScale, parentScaleId ? 'Scale Cloned' : 'Scale Created')
    publish(SubscriptionChannel.TEAM, teamId, 'AddPokerTemplateScalePayload', data, subOptions)
    return data
  }
}

export default addPokerTemplateScale
