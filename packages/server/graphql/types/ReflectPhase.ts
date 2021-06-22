import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import {resolveGQLStagesFromPhase} from '../resolvers'
import GenericMeetingStage from './GenericMeetingStage'
import NewMeetingPhase, {newMeetingPhaseFields} from './NewMeetingPhase'
import ReflectPrompt from './ReflectPrompt'

const ReflectPhase = new GraphQLObjectType<any, GQLContext>({
  name: 'ReflectPhase',
  description: 'The meeting phase where all team members check in one-by-one',
  interfaces: () => [NewMeetingPhase],
  fields: () => ({
    ...newMeetingPhaseFields(),
    focusedPromptId: {
      type: GraphQLID,
      description: 'foreign key. use focusedPrompt'
    },
    focusedPrompt: {
      type: ReflectPrompt,
      description: 'the Prompt that the facilitator wants the group to focus on',
      resolve: ({focusedPromptId}, _args, {dataLoader}) => {
        return dataLoader.get('reflectPrompts').load(focusedPromptId)
      }
    },
    promptTemplateId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'FK. The ID of the template used during the reflect phase'
    },
    reflectPrompts: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ReflectPrompt))),
      description: 'The prompts used during the reflect phase',
      resolve: async ({meetingId, promptTemplateId}, _args, {dataLoader}) => {
        const meeting = await dataLoader.get('newMeetings').load(meetingId)
        const prompts = await dataLoader.get('reflectPromptsByTemplateId').load(promptTemplateId)
        // only show prompts that were created before the meeting and
        // either have not been removed or they were removed after the meeting was created
        return prompts.filter(
          (prompt) =>
            prompt.createdAt < meeting.createdAt &&
            (!prompt.removedAt || meeting.createdAt < prompt.removedAt)
        )
      }
    },
    stages: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GenericMeetingStage))),
      resolve: resolveGQLStagesFromPhase
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  })
})

export default ReflectPhase
