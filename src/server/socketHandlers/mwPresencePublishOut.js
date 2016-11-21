import parseChannel from 'universal/utils/parseChannel';
import {EDIT, PRESENT, SOUNDOFF, PRESENCE, KICK_OUT} from 'universal/subscriptions/constants';

export default function mwPresencePublishOut(req, next) {
  const {channel, variableString: channelKey} = parseChannel(req.channel);
  if (channel === PRESENCE) {
    const {type, targetId, userId} = req.data;
    if (type === SOUNDOFF) {
      // don't ping yourself
      if (targetId === req.socket.id) {
        // silently fail
        next(true);
        return;
      }
    } else if (type === PRESENT) {
      // if we supply a target, only tell the target that I'm here
      if (targetId && targetId !== req.socket.id) {
        next(true);
        return;
      }
    } else if (type === EDIT) {
      const {socketId: senderSocketId} = req.data;
      // do not send back to self
      if (senderSocketId && senderSocketId === req.socket.id) {
        next(true);
        return;
      }
    } else if (type === KICK_OUT) {
      const authToken = req.socket.getAuthToken();
      if (authToken.sub === userId) {
        const subs = req.socket.subscriptions();
        subs.forEach((sub) => {
          if (sub.indexOf(channelKey) !== -1) {
            // remove from client cache
            req.socket.emit(sub, {
              type: 'remove',
              fields: {
                id: channelKey
              }
            });
            // stop listening
            req.socket.kickOut(sub, 'Removed from team');
          }
        });
        const idxToRemove = authToken.tms.indexOf(channelKey);
        if (idxToRemove !== -1) {
          authToken.tms.splice(idxToRemove, 1);
        }
        // replace token with one that doesn't include the teamId in tms
        req.socket.setAuthToken(authToken);
        next(true);
        return;
      }
    }
  }
  next();
}
