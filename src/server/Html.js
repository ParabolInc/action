/* eslint react/no-danger:0 */
import React, {Component, PropTypes} from 'react';
import { LookRoot, StyleSheet } from 'react-look';
import {Provider} from 'react-redux';
import {RouterContext} from 'react-router';
import {renderToString} from 'react-dom/server';

// Injects the server rendered state and app into a basic html template
export default class Html extends Component {
  static propTypes = {
    store: PropTypes.object.isRequired,
    title: PropTypes.string.isRequired,
    lookStyleElementId: PropTypes.string.isRequired,
    lookCSSToken: PropTypes.string.isRequired,
    lookConfig: PropTypes.object.isRequired,
    assets: PropTypes.object,
    renderProps: PropTypes.object
  }

  render() {
    const PROD = process.env.NODE_ENV === 'production';
    const {title, lookStyleElementId, lookCSSToken, lookConfig,
           store, assets, renderProps} = this.props;
    const {manifest, app, vendor} = assets || {};
    const initialState = `window.__INITIAL_STATE__ = ${JSON.stringify(store.getState())}`;
    const root = PROD && renderToString(
      <LookRoot config={lookConfig}>
        <Provider store={store}>
          <RouterContext {...renderProps}/>
        </Provider>
      </LookRoot>
    );

    return (
      <html>
        <head>
          <meta charSet="utf-8"/>
          <meta property="description" content="Team transparency, made easy." />
          <style dangerouslySetInnerHTML={{__html: lookCSSToken}} id={lookStyleElementId} />
          {PROD && <link rel="stylesheet" href="/static/prerender.css" type="text/css"/>}
          <title>{title}</title>
        </head>
        <body>
          <script dangerouslySetInnerHTML={{__html: initialState}}/>
          {PROD ? <div id="root" dangerouslySetInnerHTML={{__html: root}}></div> : <div id="root"></div>}
          {PROD && <script dangerouslySetInnerHTML={{__html: manifest.text}}/>}
          {PROD && <script src={vendor.js}/>}
          <script src={PROD ? app.js : '/static/app.js'}/>
        </body>
      </html>
    );
  }
}
