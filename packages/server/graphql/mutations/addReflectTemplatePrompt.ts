import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel, Threshold} from 'parabol-client/types/constEnums'
import dndNoise from 'parabol-client/utils/dndNoise'
import palettePickerOptions from '../../../client/styles/palettePickerOptions'
import {PALETTE} from '../../../client/styles/paletteV3'
import getRethink from '../../database/rethinkDriver'
import RetrospectivePrompt from '../../database/types/RetrospectivePrompt'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import AddReflectTemplatePromptPayload from '../types/AddReflectTemplatePromptPayload'

const addReflectTemplatePrompt = {
  description: 'Add a new template full of prompts',
  type: AddReflectTemplatePromptPayload,
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
    const activePrompts = await r
      .table('ReflectPrompt')
      .getAll(teamId, {index: 'teamId'})
      .filter({
        templateId,
        removedAt: null
      })
      .run()
    if (activePrompts.length >= Threshold.MAX_REFLECTION_PROMPTS) {
      return standardError(new Error('Too many prompts'), {userId: viewerId})
    }

    // RESOLUTION
    const sortOrder =
      Math.max(0, ...activePrompts.map((prompt) => prompt.sortOrder)) + 1 + dndNoise()
    const pickedColors = activePrompts.map((prompt) => prompt.groupColor)
    const availableNewColor = palettePickerOptions.find(
      (color) => !pickedColors.includes(color.hex)
    )
    const reflectPrompt = new RetrospectivePrompt({
      templateId: template.id,
      teamId: template.teamId,
      sortOrder,
      question: `New prompt #${activePrompts.length + 1}`,
      description: '',
      groupColor: availableNewColor?.hex ?? PALETTE.JADE_400,
      removedAt: null
    })

    await r
      .table('ReflectPrompt')
      .insert(reflectPrompt)
      .run()

    const promptId = reflectPrompt.id
    const data = {promptId}
    publish(SubscriptionChannel.TEAM, teamId, 'AddReflectTemplatePromptPayload', data, subOptions)
    return data
  }
}

export default addReflectTemplatePrompt
