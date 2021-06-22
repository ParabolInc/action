import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import EstimateStage from './EstimateStage'
import makeMutationPayload from './makeMutationPayload'
import resolveStage from '../resolvers/resolveStage'
export const PokerRevealVotesSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'PokerRevealVotesSuccess',
  fields: () => ({
    stage: {
      type: GraphQLNonNull(EstimateStage),
      description: 'The stage that holds the updated isVoting step',
      resolve: resolveStage('ESTIMATE')
    }
  })
})

const PokerRevealVotesPayload = makeMutationPayload(
  'PokerRevealVotesPayload',
  PokerRevealVotesSuccess
)

export default PokerRevealVotesPayload
