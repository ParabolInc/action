import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SprintPokerDefaults, SubscriptionChannel, Threshold} from 'parabol-client/types/constEnums'
import dndNoise from 'parabol-client/utils/dndNoise'
import TemplateDimension from '../../database/types/TemplateDimension'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import AddPokerTemplateDimensionPayload from '../types/AddPokerTemplateDimensionPayload'

const addPokerTemplateDimension = {
  description: 'Add a new dimension for the poker template',
  type: new GraphQLNonNull(AddPokerTemplateDimensionPayload),
  args: {
    templateId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  async resolve(_source, {templateId}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const template = await dataLoader.get('meetingTemplates').load(templateId)
    const viewerId = getUserId(authToken)

    // AUTH
    if (!template || !template.isActive) {
      return standardError(new Error('Template not found'), {userId: viewerId})
    }
    if (!isTeamMember(authToken, template.teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // VALIDATION
    const {teamId} = template
    const activeDimensions = await r
      .table('TemplateDimension')
      .getAll(teamId, {index: 'teamId'})
      .filter({templateId})
      .filter((row) => row('removedAt').default(null).eq(null))
      .run()
    if (activeDimensions.length >= Threshold.MAX_POKER_TEMPLATE_DIMENSIONS) {
      return standardError(new Error('Too many dimensions'), {userId: viewerId})
    }

    // RESOLUTION
    const sortOrder =
      Math.max(0, ...activeDimensions.map((dimension) => dimension.sortOrder)) + 1 + dndNoise()

    const availableScales = await r
      .table('TemplateScale')
      .filter({teamId})
      .filter((row) => row('removedAt').default(null).eq(null))
      .orderBy(r.desc('updatedAt'))
      .run()
    const defaultScaleId =
      availableScales.length > 0
        ? availableScales.map((teamScale) => teamScale.id)[0]
        : SprintPokerDefaults.DEFAULT_SCALE_ID

    const newDimension = new TemplateDimension({
      scaleId: defaultScaleId,
      description: '',
      sortOrder: sortOrder,
      name: `*New Dimension #${activeDimensions.length + 1}`,
      teamId,
      templateId
    })

    await r.table('TemplateDimension').insert(newDimension).run()

    const dimensionId = newDimension.id
    const data = {dimensionId}
    publish(SubscriptionChannel.TEAM, teamId, 'AddPokerTemplateDimensionPayload', data, subOptions)
    return data
  }
}

export default addPokerTemplateDimension
