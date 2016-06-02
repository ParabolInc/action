import {graphql} from 'graphql';
import {prepareClientError} from './models/utils';
import Schema from './rootSchema';

export const wsGraphQLHandler = async (body, cb) => {
  const {query, variables, ...context} = body;
  const authToken = this.getAuthToken();
  const docId = variables.doc && variables.doc.id || variables.id;
  if (!docId) {
    console.warn('No documentId found for the doc submitted via websockets!');
    return cb({_error: 'No documentId found'});
  }
  this.docQueue.add(docId);
  const result = await graphql(Schema, query, null, {authToken, socket: this, ...context}, variables);
  const {error, data} = prepareClientError(result);
  if (error) {
    this.docQueue.delete(docId);
  }
  cb(error, data);
};

/*
 * This is where you add subscription logic
 * It's a lookup table that turns a channelName into a graphQL query
 * By creating this on the server it keeps payloads really small
 * */
const subscriptionLookup = {
  getMeeting(meetingId) {
    return {
      queryString: `
        subscription($meetingId: ID!) {
          getMeeting(meetingId: $meetingId) {
            id,
            content,
            currentEditors,
            lastUpdatedBy
          }
        }`,
      variables: {meetingId}
    };
  }
};

const parseChannelName = channelName => {
  const channelVars = channelName.split('/');
  const subscriptionName = channelVars.shift();
  const queryFactory = subscriptionLookup[subscriptionName];
  return queryFactory ? queryFactory(...channelVars) : {};
};

// This should be arrow syntax, but doesn't work when it is
export function wsGraphQLSubHandler(subbedChannelName) {
  const authToken = this.getAuthToken();
  const {queryString, variables, ...rootVals} = parseChannelName(subbedChannelName);
  graphql(Schema, queryString, {
    socket: this, authToken, subbedChannelName, ...rootVals}, variables);
}
