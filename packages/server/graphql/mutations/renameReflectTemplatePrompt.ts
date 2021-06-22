import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import RenameReflectTemplatePromptPayload from '../types/RenameReflectTemplatePromptPayload'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'

const renameReflectTemplatePrompt = {
  description: 'Rename a reflect template prompt',
  type: RenameReflectTemplatePromptPayload,
  args: {
    promptId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    question: {
      type: new GraphQLNonNull(GraphQLString)
    }
  },
  async resolve(_source, {promptId, question}, {authToken, dataLoader, socketId: mutatorId}) {
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
    const trimmedQuestion = question.trim().slice(0, 100)
    const normalizedQuestion = trimmedQuestion || 'Unnamed Prompt'

    const allPrompts = await r
      .table('ReflectPrompt')
      .getAll(teamId, {index: 'teamId'})
      .filter({
        removedAt: null,
        templateId
      })
      .run()
    if (allPrompts.find((prompt) => prompt.question === normalizedQuestion)) {
      return standardError(new Error('Duplicate question template'), {userId: viewerId})
    }

    // RESOLUTION
    await r
      .table('ReflectPrompt')
      .get(promptId)
      .update({
        question: normalizedQuestion,
        updatedAt: now
      })
      .run()

    const data = {promptId}
    publish(
      SubscriptionChannel.TEAM,
      teamId,
      'RenameReflectTemplatePromptPayload',
      data,
      subOptions
    )
    return data
  }
}

export default renameReflectTemplatePrompt
