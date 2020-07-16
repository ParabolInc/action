import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import NewMeetingPhase, {newMeetingPhaseFields} from './NewMeetingPhase'
import RetroPhaseItem from './RetroPhaseItem'
import GenericMeetingStage from './GenericMeetingStage'
import {GQLContext} from '../graphql'
import {resolveGQLStagesFromPhase} from '../resolvers'

const ReflectPhase = new GraphQLObjectType<any, GQLContext>({
  name: 'ReflectPhase',
  description: 'The meeting phase where all team members check in one-by-one',
  interfaces: () => [NewMeetingPhase],
  fields: () => ({
    ...newMeetingPhaseFields(),
    focusedPhaseItemId: {
      type: GraphQLID,
      description: 'foreign key. use focusedPhaseItem'
    },
    focusedPhaseItem: {
      type: RetroPhaseItem,
      description: 'the phase item that the facilitator wants the group to focus on',
      resolve: ({focusedPhaseItemId}, _args, {dataLoader}) => {
        return dataLoader.get('reflectPrompts').load(focusedPhaseItemId)
      }
    },
    promptTemplateId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'FK. The ID of the template used during the reflect phase'
    },
    reflectPrompts: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(RetroPhaseItem))),
      description: 'The prompts used during the reflect phase',
      resolve: async ({promptTemplateId, templateId}, _args, {dataLoader}) => {
        if (templateId === promptTemplateId) {
          const prompts = await dataLoader.get('reflectPromptsByTemplateId').load(templateId)
          prompts.sort((a, b) => (a.sortOrder < b.sortOrder ? -1 : 1))
          return prompts
        }
        return []
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
