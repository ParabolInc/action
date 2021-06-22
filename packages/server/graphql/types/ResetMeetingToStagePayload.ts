import {GraphQLObjectType} from 'graphql'
import NewMeeting from './NewMeeting'
import {resolveNewMeeting} from '../resolvers'
import StandardMutationError from './StandardMutationError'
import {GQLContext} from '../graphql'

const ResetMeetingToStagePayload = new GraphQLObjectType<any, GQLContext>({
  name: 'ResetMeetingToStagePayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    meeting: {
      type: NewMeeting,
      resolve: resolveNewMeeting
    }
  })
})

export default ResetMeetingToStagePayload
