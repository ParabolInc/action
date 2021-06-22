import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import ReflectTemplatePromptUpdateGroupColorPayload from '../types/ReflectTemplatePromptUpdateGroupColorPayload'

const reflectTemplatePromptUpdateGroupColor = {
  groupColor: 'Update the groupColor of a reflection prompt',
  type: ReflectTemplatePromptUpdateGroupColorPayload,
  args: {
    promptId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    groupColor: {
      type: new GraphQLNonNull(GraphQLString)
    }
  },
  async resolve(_source, {promptId, groupColor}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = await getRethink()
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const viewerId = getUserId(authToken)

    const prompt = await r
      .table('ReflectPrompt')
      .get(promptId)
      .run()

    // AUTH
    if (!prompt || prompt.removedAt) {
      return standardError(new Error('Prompt not found'), {userId: viewerId})
    }
    if (!isTeamMember(authToken, prompt.teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // VALIDATION
    const {teamId} = prompt

    // RESOLUTION
    await r
      .table('ReflectPrompt')
      .get(promptId)
      .update({
        groupColor,
        updatedAt: now
      })
      .run()

    const data = {promptId}
    publish(
      SubscriptionChannel.TEAM,
      teamId,
      'ReflectTemplatePromptUpdateGroupColorPayload',
      data,
      subOptions
    )
    return data
  }
}

export default reflectTemplatePromptUpdateGroupColor
