import React from 'react';
import { Presets, Plugins, LookRoot } from 'react-look';
import {Router, browserHistory} from 'react-router';
import {Provider} from 'react-redux';
import routes from '../universal/routes/index';
import {syncHistoryWithStore} from 'react-router-redux';
import {ensureState} from 'redux-optimistic-ui';

const lookConfig = Presets['react-dom'];
lookConfig.styleElementId = '_look';

if (!__PRODUCTION__) {
  lookConfig.plugins.push(Plugins.friendlyClassName);
}

export default function Root({store}) {
  const history = syncHistoryWithStore(
    browserHistory, store,
    {selectLocationState: state => ensureState(state).get('routing')}
  );

  return (
    <LookRoot config={lookConfig}>
      <Provider store={store}>
        <div>
          <Router history={history} routes={routes(store)} />
        </div>
      </Provider>
    </LookRoot>
  );
}

Root.propTypes = {
  store: React.PropTypes.object.isRequired
};
