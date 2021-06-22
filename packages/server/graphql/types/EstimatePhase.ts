import {GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import {resolveGQLStagesFromPhase} from '../resolvers'
import EstimateStage from './EstimateStage'
import NewMeetingPhase, {newMeetingPhaseFields} from './NewMeetingPhase'

const EstimatePhase = new GraphQLObjectType<any, GQLContext>({
  name: 'EstimatePhase',
  description: 'The meeting phase where all team members estimate a the point value of a task',
  interfaces: () => [NewMeetingPhase],
  fields: () => ({
    ...newMeetingPhaseFields(),
    stages: {
      type: GraphQLNonNull(GraphQLList(GraphQLNonNull(EstimateStage))),
      resolve: resolveGQLStagesFromPhase
    }
  })
})

export default EstimatePhase
