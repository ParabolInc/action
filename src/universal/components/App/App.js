import React, {PropTypes, Component} from 'react';
import look, { StyleSheet } from 'react-look';
import theme from 'universal/styles/theme';
import tinycolor from 'tinycolor2';
import layoutStyle from 'universal/styles/layout';
import './addFontAwesome';

let styles = {};

@look
// eslint-disable-next-line react/prefer-stateless-function
export default class App extends Component {
  static propTypes = {
    children: PropTypes.any
  };

  render() {
    return (
      <div className={styles.app}>
        {this.props.children}
      </div>
    );
  }
}

styles = StyleSheet.create({
  app: {
    height: '100vh',
    margin: 0,
    maxWidth: layoutStyle.maxWidth,
    padding: 0
  }
});

StyleSheet.addCSS({
  '*': {
    boxSizing: 'border-box'
  },

  '*::before, *::after': {
    boxSizing: 'border-box'
  },

  html: {
    fontSize: '16px'
  },

  body: {
    color: theme.palette.dark10d,
    fontFamily: theme.typography.sansSerif,
    '-moz-osx-font-smoothing': 'grayscale',
    '-webkit-font-smoothing': 'antialiased',
    fontSize: '16px',
    fontWeight: '400',
    lineHeight: 'normal',
    margin: 0,
    padding: 0
  },

  a: {
    color: theme.palette.warm,
    textDecoration: 'none'
  },

  'a:hover, a:focus': {
    color: tinycolor(theme.palette.warm).darken(15).toHexString(),
    textDecoration: 'underline'
  },

  input: {
    fontFamily: theme.typography.sansSerif,
    '-moz-osx-font-smoothing': 'grayscale',
    '-webkit-font-smoothing': 'antialiased'
  }
});
