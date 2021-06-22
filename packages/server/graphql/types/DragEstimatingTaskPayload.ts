import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import resolveStage from '../resolvers/resolveStage'
import EstimateStage from './EstimateStage'
import makeMutationPayload from './makeMutationPayload'
import PokerMeeting from './PokerMeeting'

export const DragEstimatingTaskSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'DragEstimatingTaskSuccess',
  fields: () => ({
    meetingId: {
      type: GraphQLNonNull(GraphQLID)
    },
    meeting: {
      type: GraphQLNonNull(PokerMeeting),
      resolve: ({meetingId}, _args, {dataLoader}) => {
        return dataLoader.get('newMeetings').load(meetingId)
      }
    },
    stageId: {
      type: GraphQLNonNull(GraphQLID)
    },
    stage: {
      type: GraphQLNonNull(EstimateStage),
      resolve: resolveStage('ESTIMATE')
    }
  })
})

const DragEstimatingTaskPayload = makeMutationPayload(
  'DragEstimatingTaskPayload',
  DragEstimatingTaskSuccess
)

export default DragEstimatingTaskPayload
