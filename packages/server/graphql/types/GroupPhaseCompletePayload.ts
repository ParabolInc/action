import {GraphQLNonNull, GraphQLList, GraphQLObjectType, GraphQLID} from 'graphql'
import RetroReflectionGroup from './RetroReflectionGroup'
import RetrospectiveMeeting from './RetrospectiveMeeting'
import {resolveNewMeeting} from '../resolvers'
import {GQLContext} from '../graphql'

const GroupPhaseCompletePayload = new GraphQLObjectType<any, GQLContext>({
  name: 'GroupPhaseCompletePayload',
  fields: () => ({
    emptyReflectionGroupIds: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID))),
      description: 'a list of empty reflection groups to remove'
    },
    meeting: {
      type: new GraphQLNonNull(RetrospectiveMeeting),
      description: 'the current meeting',
      resolve: resolveNewMeeting
    },
    reflectionGroups: {
      type: new GraphQLList(RetroReflectionGroup),
      description: 'a list of updated reflection groups',
      resolve: ({reflectionGroupIds}, _args, {dataLoader}) => {
        return reflectionGroupIds
          ? dataLoader.get('retroReflectionGroups').loadMany(reflectionGroupIds)
          : []
      }
    }
  })
})

export default GroupPhaseCompletePayload
