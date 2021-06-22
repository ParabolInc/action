import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import NewMeetingStage, {newMeetingStageFields} from './NewMeetingStage'

const phaseTypes = ['reflect', 'group', 'vote', 'firstcall', 'lastcall', 'SCOPE'] as const

const GenericMeetingStage = new GraphQLObjectType<any, GQLContext>({
  name: 'GenericMeetingStage',
  description: 'A stage of a meeting that has no extra state. Only used for single-stage phases',
  interfaces: () => [NewMeetingStage],
  isTypeOf: ({phaseType}) => phaseTypes.includes(phaseType),
  fields: () => ({
    ...newMeetingStageFields()
  })
})

export default GenericMeetingStage
