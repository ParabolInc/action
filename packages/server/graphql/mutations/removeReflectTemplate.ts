import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import MeetingSettingsRetrospective from '../../database/types/MeetingSettingsRetrospective'
import ReflectTemplate from '../../database/types/ReflectTemplate'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import RemoveReflectTemplatePayload from '../types/RemoveReflectTemplatePayload'

const removeReflectTemplate = {
  description: 'Remove a template full of prompts',
  type: RemoveReflectTemplatePayload,
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
        .filter({isActive: true, type: 'retrospective'})
        .orderBy('name')
        .coerceTo('array') as unknown) as ReflectTemplate[],
      settings: (r
        .table('MeetingSettings')
        .getAll(teamId, {index: 'teamId'})
        .filter({meetingType: 'retrospective'})
        .nth(0) as unknown) as MeetingSettingsRetrospective
    }).run()

    // RESOLUTION
    const {id: settingsId} = settings
    await r({
      template: r
        .table('MeetingTemplate')
        .get(templateId)
        .update({isActive: false, updatedAt: now}),
      reflectPrompts: r
        .table('ReflectPrompt')
        .getAll(teamId, {index: 'teamId'})
        .filter({
          templateId
        })
        .update({
          removedAt: now,
          updatedAt: now
        })
    }).run()

    if (settings.selectedTemplateId === templateId) {
      const nextTemplate = templates.find((template) => template.id !== templateId)
      const nextTemplateId = nextTemplate?.id ?? 'workingStuckTemplate'
      await r
        .table('MeetingSettings')
        .get(settingsId)
        .update({
          selectedTemplateId: nextTemplateId
        })
        .run()
    }

    const data = {templateId, settingsId}
    publish(SubscriptionChannel.TEAM, teamId, 'RemoveReflectTemplatePayload', data, subOptions)
    return data
  }
}

export default removeReflectTemplate
