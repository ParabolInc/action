import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {getUserId} from '../../utils/authorization'
import errorFilter from '../errorFilter'
import {GQLContext} from '../graphql'
import {resolveTeam} from '../resolvers'
import NotifyTeamArchived from './NotifyTeamArchived'
import StandardMutationError from './StandardMutationError'
import Team from './Team'

const ArchiveTeamPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'ArchiveTeamPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    team: {
      type: Team,
      resolve: resolveTeam
    },
    notification: {
      type: NotifyTeamArchived,
      description: 'A notification explaining that the team was archived and removed from view',
      resolve: async ({notificationIds}, _args, {authToken, dataLoader}) => {
        if (!notificationIds) return null
        const notifications = (
          await dataLoader.get('notifications').loadMany(notificationIds)
        ).filter(errorFilter)
        const viewerId = getUserId(authToken)
        return notifications.find((notification) => notification.userId === viewerId)
      }
    },
    removedSuggestedActionIds: {
      type: new GraphQLList(GraphQLID),
      description: 'all the suggested actions that never happened'
    },
    teamTemplateIds: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID))),
      description: 'A list of the ids of templates created by a team'
    }
  })
})

export default ArchiveTeamPayload
