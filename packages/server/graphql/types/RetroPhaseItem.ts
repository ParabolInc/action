import {GraphQLFloat, GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import ReflectPrompt, {reflectPromptFields} from './ReflectPrompt'
import ReflectTemplate from './ReflectTemplate'
import {GQLContext} from '../graphql'

const RetroPhaseItem = new GraphQLObjectType<any, GQLContext>({
  name: 'RetroPhaseItem',
  description:
    'A team-specific retro phase. Usually 3 or 4 exist per team, eg Good/Bad/Change, 4Ls, etc.',
  interfaces: () => [ReflectPrompt],
  fields: () => ({
    ...reflectPromptFields(),
    sortOrder: {
      type: new GraphQLNonNull(GraphQLFloat),
      description: 'the order of the items in the template'
    },
    templateId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'FK for template'
    },
    template: {
      type: new GraphQLNonNull(ReflectTemplate),
      description: 'The template that this prompt belongs to',
      resolve: ({templateId}, _args, {dataLoader}) => {
        return dataLoader.get('reflectTemplates').load(templateId)
      }
    },
    title: {
      type: new GraphQLNonNull(GraphQLString),
      description:
        'The title of the phase of the retrospective. Often a short version of the question'
    },
    question: {
      description:
        'The question to answer during the phase of the retrospective (eg What went well?)',
      type: new GraphQLNonNull(GraphQLString)
    },
    description: {
      description:
        'The description to the question for further context. A long version of the question.',
      type: new GraphQLNonNull(GraphQLString),
      resolve: ({description}) => description || ''
    },
    groupColor: {
      description: 'The color used to visually group a phase item.',
      type: new GraphQLNonNull(GraphQLString),
      resolve: ({groupColor}) => groupColor || '#FFFFFF'
    }
  })
})

export default RetroPhaseItem
