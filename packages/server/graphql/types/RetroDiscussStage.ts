import {GraphQLID, GraphQLObjectType, GraphQLFloat, GraphQLNonNull} from 'graphql'
import NewMeetingStage, {newMeetingStageFields} from './NewMeetingStage'
import RetroReflectionGroup from './RetroReflectionGroup'
import {makeResolve} from '../resolvers'
import {GQLContext} from '../graphql'
import {NewMeetingPhaseTypeEnum} from '../../database/types/GenericMeetingPhase'

const RetroDiscussStage = new GraphQLObjectType<any, GQLContext>({
  name: 'RetroDiscussStage',
  description: 'The stage where the team discusses a single theme',
  interfaces: () => [NewMeetingStage],
  isTypeOf: ({phaseType}) => (phaseType as NewMeetingPhaseTypeEnum) === 'discuss',
  fields: () => ({
    ...newMeetingStageFields(),
    reflectionGroupId: {
      type: GraphQLID,
      description: 'foreign key. use reflectionGroup'
    },
    reflectionGroup: {
      type: RetroReflectionGroup,
      description: 'the group that is the focal point of the discussion',
      resolve: makeResolve('reflectionGroupId', 'reflectionGroup', 'retroReflectionGroups')
    },
    sortOrder: {
      type: new GraphQLNonNull(GraphQLFloat),
      description: 'The sort order for reprioritizing discussion topics'
    }
  })
})

export default RetroDiscussStage
