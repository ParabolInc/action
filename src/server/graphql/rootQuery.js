import {GraphQLObjectType} from 'graphql';
import cachedUser from './models/CachedUser/cachedUserQuery';
import meeting from './models/Meeting/meetingQuery';
import team from './models/Team/teamQuery';

const rootFields = Object.assign(cachedUser, meeting, team);

export default new GraphQLObjectType({
  name: 'RootQuery',
  fields: () => rootFields
});
