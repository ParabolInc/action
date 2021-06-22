import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SprintPokerDefaults, SubscriptionChannel, Threshold} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import PokerTemplate from '../../database/types/PokerTemplate'
import TemplateDimension from '../../database/types/TemplateDimension'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import AddPokerTemplatePayload from '../types/AddPokerTemplatePayload'
import sendTemplateEventToSegment from './helpers/sendTemplateEventToSegment'

const addPokerTemplate = {
  description: 'Add a new poker template with a default dimension created',
  type: new GraphQLNonNull(AddPokerTemplatePayload),
  args: {
    parentTemplateId: {
      type: GraphQLID
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  async resolve(
    _source,
    {parentTemplateId, teamId},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const viewerId = getUserId(authToken)

    // AUTH
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // VALIDATION
    const allTemplates = await r
      .table('MeetingTemplate')
      .getAll(teamId, {index: 'teamId'})
      .filter({isActive: true})
      .filter({type: 'poker'})
      .run()

    if (allTemplates.length >= Threshold.MAX_RETRO_TEAM_TEMPLATES) {
      return standardError(new Error('Too many templates'), {userId: viewerId})
    }

    const viewerTeam = await dataLoader.get('teams').load(teamId)
    let data
    if (parentTemplateId) {
      const parentTemplate = await dataLoader.get('meetingTemplates').load(parentTemplateId)
      if (!parentTemplate) {
        return standardError(new Error('Parent template not found'), {userId: viewerId})
      }
      const {name, scope} = parentTemplate
      if (scope === 'TEAM') {
        if (!isTeamMember(authToken, parentTemplate.teamId))
          return standardError(new Error('Template is scoped to team'), {userId: viewerId})
      } else if (scope === 'ORGANIZATION') {
        const parentTemplateTeam = await dataLoader.get('teams').load(parentTemplate.teamId)
        if (viewerTeam.orgId !== parentTemplateTeam.orgId) {
          return standardError(new Error('Template is scoped to organization'), {userId: viewerId})
        }
      }
      const copyName = `${name} Copy`
      const existingCopyCount = await r
        .table('MeetingTemplate')
        .getAll(teamId, {index: 'teamId'})
        .filter({isActive: true})
        .filter({type: 'poker'})
        .filter((row) => row('name').match(`^${copyName}`) as any)
        .count()
        .run()
      const newName = existingCopyCount === 0 ? copyName : `${copyName} #${existingCopyCount + 1}`
      const newTemplate = new PokerTemplate({
        name: newName,
        teamId,
        orgId: viewerTeam.orgId,
        parentTemplateId
      })

      const dimensions = await dataLoader
        .get('templateDimensionsByTemplateId')
        .load(parentTemplate.id)
      const activeDimensions = dimensions.filter(({removedAt}) => !removedAt)
      const newTemplateDimensions = activeDimensions.map((dimension) => {
        return new TemplateDimension({
          ...dimension,
          teamId,
          templateId: newTemplate.id
        })
      })

      await r({
        newTemplate: r.table('MeetingTemplate').insert(newTemplate),
        newTemplateDimensions: r.table('TemplateDimension').insert(newTemplateDimensions)
      }).run()
      sendTemplateEventToSegment(viewerId, newTemplate, 'Template Cloned')
      data = {templateId: newTemplate.id}
    } else {
      if (allTemplates.find((template) => template.name === '*New Template')) {
        return standardError(new Error('Template already created'), {userId: viewerId})
      }
      const team = await dataLoader.get('teams').load(teamId)
      const {orgId} = team

      const newTemplate = new PokerTemplate({name: '*New Template', teamId, orgId})
      const templateId = newTemplate.id
      const newDimension = new TemplateDimension({
        scaleId: SprintPokerDefaults.DEFAULT_SCALE_ID,
        description: '',
        sortOrder: 0,
        name: '*New Dimension',
        teamId,
        templateId
      })

      await r({
        newTemplate: r.table('MeetingTemplate').insert(newTemplate),
        newTemplateDimension: r.table('TemplateDimension').insert(newDimension)
      }).run()
      sendTemplateEventToSegment(viewerId, newTemplate, 'Template Created')
      data = {templateId}
    }
    publish(SubscriptionChannel.TEAM, teamId, 'AddPokerTemplatePayload', data, subOptions)
    return data
  }
}

export default addPokerTemplate
