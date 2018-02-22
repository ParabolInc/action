import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql';
import Notification, {notificationInterfaceFields} from 'server/graphql/types/Notification';
import Team from 'server/graphql/types/Team';
import TeamRemovedNotification from 'server/graphql/types/TeamRemovedNotification';

const NotifyKickedOut = new GraphQLObjectType({
  name: 'NotifyKickedOut',
  description: 'A notification sent to someone who was just kicked off a team',
  interfaces: () => [Notification, TeamRemovedNotification],
  fields: () => ({
    ...notificationInterfaceFields,
    isKickout: {
      type: GraphQLBoolean,
      description: 'true if kicked out, false if leaving by choice'
    },
    teamName: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of the team the user is joining'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The teamId the user was kicked out of'
    },
    team: {
      type: Team,
      description: 'The team the task is on',
      resolve: ({teamId}, args, {dataLoader}) => {
        return dataLoader.get('teams').load(teamId);
      }
    }
  })
});

export default NotifyKickedOut;
