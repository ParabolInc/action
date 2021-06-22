import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import {resolveNewMeeting} from '../resolvers'
import resolveStage from '../resolvers/resolveStage'
import NewMeeting from './NewMeeting'
import RetroDiscussStage from './RetroDiscussStage'
import StandardMutationError from './StandardMutationError'

const DragDiscussionTopicPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'DragDiscussionTopicPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    meeting: {
      type: NewMeeting,
      resolve: resolveNewMeeting
    },
    stage: {
      type: RetroDiscussStage,
      resolve: resolveStage('discuss')
    }
  })
})

export default DragDiscussionTopicPayload
