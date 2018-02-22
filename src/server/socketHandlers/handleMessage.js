import {
  GQL_CONNECTION_KEEP_ALIVE, GQL_CONNECTION_TERMINATE, GQL_DATA, GQL_ERROR, GQL_START,
  GQL_STOP
} from 'universal/utils/constants';
import handleDisconnect from 'server/socketHandlers/handleDisconnect';
import sendMessage from 'server/socketHelpers/sendMessage';
import wsGraphQLHandler from 'server/socketHandlers/wsGraphQLHandler';
import wsRelaySubscribeHandler from 'server/socketHandlers/wsRelaySubscribeHandler';
import relayUnsubscribe from 'server/utils/relayUnsubscribe';

const isSubscriptionPayload = (payload) => payload.query.startsWith('subscription');
const isQueryProvided = (payload) => payload && payload.query;

const handleMessage = (connectionContext) => async (message) => {
  const {socket, subs} = connectionContext;
  // catch raw, non-graphql protocol messages here
  if (message === GQL_CONNECTION_KEEP_ALIVE) {
    connectionContext.isAlive = true;
    return;
  }

  let parsedMessage;
  try {
    parsedMessage = JSON.parse(message);
  } catch (e) {
    /*
     * Invalid frame payload data
     * The endpoint is terminating the connection because a message was received that contained inconsistent data
     * (e.g., non-UTF-8 data within a text message).
     */
    handleDisconnect(connectionContext, {exitCode: 1007})();
    return;
  }

  const {id: opId, type, payload} = parsedMessage;

  if (type === GQL_CONNECTION_TERMINATE) {
    handleDisconnect(connectionContext)();
    // this GQL_START logic will be simplified when we move to persisted queries
  } else if (type === GQL_START) {
    if (!isQueryProvided(payload)) {
      sendMessage(socket, GQL_ERROR, {errors: [new Error('No payload provided')]}, opId);
      return;
    }
    if (isSubscriptionPayload(payload)) {
      wsRelaySubscribeHandler(connectionContext, parsedMessage);
    } else {
      const result = await wsGraphQLHandler(connectionContext, parsedMessage);
      const resultType = result.errors ? GQL_ERROR : GQL_DATA;
      sendMessage(socket, resultType, result, opId);
    }
  } else if (type === GQL_STOP) {
    relayUnsubscribe(subs, opId);
  }
};

export default handleMessage;
