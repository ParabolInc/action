import {GraphQLObjectType} from 'graphql';
import cachedUser from './models/CachedUser/cachedUserQuery';
// import meeting from './models/Meeting/meetingQuery';

const rootFields = Object.assign(cachedUser);

export default new GraphQLObjectType({
  name: 'RootQuery',
  fields: () => rootFields
});
