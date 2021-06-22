import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import RemoveReflectTemplatePromptPayload from '../types/RemoveReflectTemplatePromptPayload'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'

const removeReflectTemplatePrompt = {
  description: 'Remove a prompt from a template',
  type: RemoveReflectTemplatePromptPayload,
  args: {
    promptId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  async resolve(_source, {promptId}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = await getRethink()
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const prompt = await r
      .table('ReflectPrompt')
      .get(promptId)
      .run()
    const viewerId = getUserId(authToken)

    // AUTH
    if (!prompt || prompt.removedAt) {
      return standardError(new Error('Prompt not found'), {userId: viewerId})
    }
    if (!isTeamMember(authToken, prompt.teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // VALIDATION
    const {teamId, templateId} = prompt
    const promptCount = await r
      .table('ReflectPrompt')
      .getAll(teamId, {index: 'teamId'})
      .filter({
        removedAt: null,
        templateId: templateId
      })
      .count()
      .default(0)
      .run()

    if (promptCount <= 1) {
      return standardError(new Error('No prompts remain'), {userId: viewerId})
    }

    // RESOLUTION
    await r
      .table('ReflectPrompt')
      .get(promptId)
      .update({
        removedAt: now,
        updatedAt: now
      })
      .run()

    const data = {promptId, templateId}
    publish(
      SubscriptionChannel.TEAM,
      teamId,
      'RemoveReflectTemplatePromptPayload',
      data,
      subOptions
    )
    return data
  }
}

export default removeReflectTemplatePrompt
