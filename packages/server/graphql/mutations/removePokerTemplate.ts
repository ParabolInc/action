import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SprintPokerDefaults, SubscriptionChannel} from 'parabol-client/types/constEnums'
import MeetingSettingsPoker from '../../database/types/MeetingSettingsPoker'
import PokerTemplate from '../../database/types/PokerTemplate'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import RemovePokerTemplatePayload from '../types/RemovePokerTemplatePayload'

const removePokerTemplate = {
  description: 'Remove a poker meeting template',
  type: new GraphQLNonNull(RemovePokerTemplatePayload),
  args: {
    templateId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  async resolve(_source, {templateId}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = await getRethink()
    const now = new Date()
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
    const {templates, settings} = await r({
      templates: (r
        .table('MeetingTemplate')
        .getAll(teamId, {index: 'teamId'})
        .filter({isActive: true, type: 'poker'})
        .orderBy('name')
        .coerceTo('array') as unknown) as PokerTemplate[],
      settings: (r
        .table('MeetingSettings')
        .getAll(teamId, {index: 'teamId'})
        .filter({meetingType: 'poker'})
        .nth(0) as unknown) as MeetingSettingsPoker
    }).run()

    // RESOLUTION
    const {id: settingsId} = settings
    template.isActive = false
    await r({
      template: r
        .table('MeetingTemplate')
        .get(templateId)
        .update({isActive: false, updatedAt: now}),
      dimensions: r
        .table('TemplateDimension')
        .getAll(teamId, {index: 'teamId'})
        .filter({
          templateId
        })
        .update({removedAt: now})
    }).run()

    if (settings.selectedTemplateId === templateId) {
      const nextTemplate = templates.find((template) => template.id !== templateId)
      const nextTemplateId = nextTemplate?.id ?? SprintPokerDefaults.DEFAULT_TEMPLATE_ID
      await r
        .table('MeetingSettings')
        .get(settingsId)
        .update({
          selectedTemplateId: nextTemplateId
        })
        .run()
    }

    const data = {templateId, settingsId}
    publish(SubscriptionChannel.TEAM, teamId, 'RemovePokerTemplatePayload', data, subOptions)
    return data
  }
}

export default removePokerTemplate
