import {render} from 'react-dom';
import React from 'react';
import {cashay} from 'cashay';
import ActionHTTPTransport from 'universal/utils/ActionHTTPTransport';
import makeStore from './makeStore';
import Root from './Root';

// const {routing} = window.__INITIAL_STATE__; // eslint-disable-line no-underscore-dangle

const initialState = {};

const createCashay = (store, cashaySchema) => {
  const persistedToken = store.getState().auth.token;
  cashay.create({
    store,
    schema: cashaySchema,
    httpTransport: new ActionHTTPTransport(persistedToken)
  });
};

(async() => {
  const store = await makeStore(initialState);
  // Create the Cashay singleton:
  let cashaySchema = null;
  if (__PRODUCTION__) {
    /*
     * During the production client bundle build, the server will need to be
     * stopped.
     */
    // eslint-disable-next-line global-require
    cashaySchema = require('cashay!../server/utils/getCashaySchema.js?stopRethink');
    createCashay(store, cashaySchema);
    render(
      <Root store={store}/>,
      document.getElementById('root')
    );
  } else {
    // eslint-disable-next-line global-require
    cashaySchema = require('cashay!../server/utils/getCashaySchema.js');

    // Hot Module Replacement API
    // eslint-disable-next-line global-require
    const {AppContainer} = require('react-hot-loader');
    createCashay(store, cashaySchema);
    // ENABLE THIS FOR EXPLORING FRONT END PERFORMANCE
    // const {whyDidYouUpdate} = require('why-did-you-update');
    // whyDidYouUpdate(React);
    // ENABLE THIS AS ANOTHER MEANS OF TESTING FRONT END PERFORMANCE
    // const Perf = require('react-addons-perf');
    // window.Perf = Perf;
    render(
      <AppContainer>
        <Root store={store}/>
      </AppContainer>,
      document.getElementById('root')
    );

    if (module.hot) {
      /* eslint-disable global-require, no-shadow */
      module.hot.accept('./Root', () => {
        const Root = require('./Root');
        render(
          <AppContainer>
            <Root store={store}/>
          </AppContainer>,
          document.getElementById('root')
        );
        /* eslint-enable global-require */
      });
    }
  }
})();
