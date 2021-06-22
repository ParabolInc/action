import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import resolveStage from '../resolvers/resolveStage'
import EstimateStage from './EstimateStage'
import makeMutationPayload from './makeMutationPayload'

export const PokerSetFinalScoreSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'PokerSetFinalScoreSuccess',
  fields: () => ({
    stage: {
      type: GraphQLNonNull(EstimateStage),
      description: 'The stage that holds the updated finalScore',
      resolve: resolveStage('ESTIMATE')
    }
  })
})

const PokerSetFinalScorePayload = makeMutationPayload(
  'PokerSetFinalScorePayload',
  PokerSetFinalScoreSuccess
)

export default PokerSetFinalScorePayload
