import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import EstimateStage from './EstimateStage'
import makeMutationPayload from './makeMutationPayload'
import resolveStage from '../resolvers/resolveStage'
export const VoteForPokerStorySuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'VoteForPokerStorySuccess',
  fields: () => ({
    stage: {
      type: GraphQLNonNull(EstimateStage),
      description: 'The stage that holds the updated scores',
      resolve: resolveStage('ESTIMATE')
    }
  })
})

const VoteForPokerStoryPayload = makeMutationPayload(
  'VoteForPokerStoryPayload',
  VoteForPokerStorySuccess
)

export default VoteForPokerStoryPayload
