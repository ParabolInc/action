import React, { Component, PropTypes } from 'react';
import look, { StyleSheet } from 'react-look';
import * as appTheme from 'universal/styles/theme';
import tinycolor from 'tinycolor2';

const combineStyles = StyleSheet.combineStyles;
const { cool, warm, dark, mid, light } = appTheme.palette;

const makeSolidTheme = (themeColor, textColor = '#fff', style = 'solid', opacity = '.65') => {
  let buttonColor = themeColor;
  let color = textColor;

  if (style === 'inverted') {
    buttonColor = tinycolor.mix(themeColor, '#fff', 90).toHexString();
    color = tinycolor.mix(textColor, '#000', 10).toHexString();
  }

  return {
    backgroundColor: buttonColor,
    borderColor: buttonColor,
    color,

    ':hover': {
      color,
      opacity
    },
    ':focus': {
      color,
      opacity
    }
  };
};

const makeOutlinedTheme = (color, opacity = '.5') => ({
  backgroundColor: 'transparent',
  borderColor: 'currentColor',
  color,

  ':hover': {
    color,
    opacity
  },
  ':focus': {
    color,
    opacity
  }
});

let keyframesDip = {};
let styles = {};

@look
// eslint-disable-next-line react/prefer-stateless-function
export default class Button extends Component {

  // Prop Options:
  // -------------
  // size: smallest, small, medium, large, largest
  // style: solid, outlined, inverted
  // theme: cool, warm, dark, mid, light, white

  static propTypes = {
    label: PropTypes.string,
    onClick: PropTypes.func,
    size: PropTypes.string,
    style: PropTypes.string,
    theme: PropTypes.string,
    title: PropTypes.string
  }

  render() {
    const {
      label,
      onClick,
      size,
      style,
      theme,
      title
    } = this.props;

    const buttonLabel = label || 'Label Me';
    const buttonSize = size || 'medium';
    const buttonStyle = style || 'solid';
    const buttonTheme = theme || 'dark';
    const buttonTitle = title || buttonLabel;
    const themeName = buttonTheme.charAt(0).toUpperCase() + buttonTheme.slice(1);
    const styleThemeName = `${buttonStyle}${themeName}`;
    const buttonStyles = combineStyles(styles.base, styles[buttonSize], styles[styleThemeName]);

    return (
      <button className={buttonStyles} onClick={onClick} title={buttonTitle}>
        {buttonLabel}
      </button>
    );
  }
}

keyframesDip = StyleSheet.keyframes({
  '0%': {
    transform: 'translate(0, 0)'
  },
  '50%': {
    transform: 'translate(0, .25rem)'
  },
  '100%': {
    transform: 'translate(0)'
  }
});

styles = StyleSheet.create({
  // Button base
  base: {
    border: '1px solid transparent',
    cursor: 'pointer',
    display: 'inline-block',
    fontSize: '1rem',
    fontWeight: 700,
    lineHeight: 'normal',
    outline: 'none',
    padding: '1em 2em',
    textAlign: 'center',
    textDecoration: 'none',
    textTransform: 'uppercase',

    ':hover': {
      textDecoration: 'none'
    },
    ':focus': {
      textDecoration: 'none'
    },

    ':active': {
      animationDuration: '.1s',
      animationName: keyframesDip,
      animationTimingFunction: 'ease-in'
    }
  },

  // Button sizes
  smallest: {
    fontSize: '.75rem'
  },
  small: {
    fontSize: '.875rem'
  },
  medium: {
    fontSize: '1rem'
  },
  large: {
    fontSize: '1.125rem'
  },
  largest: {
    fontSize: '1.25rem'
  },

  // Button solid themes
  solidCool: makeSolidTheme(cool),
  solidWarm: makeSolidTheme(warm),
  solidDark: makeSolidTheme(dark),
  solidMid: makeSolidTheme(mid),
  solidLight: makeSolidTheme(light, dark),
  solidWhite: makeSolidTheme('#fff', dark),

  // Outlined button themes
  outlinedCool: makeOutlinedTheme(cool),
  outlinedWarm: makeOutlinedTheme(warm),
  outlinedDark: makeOutlinedTheme(dark),
  outlinedMid: makeOutlinedTheme(mid),
  outlinedLight: makeOutlinedTheme(light),
  outlinedWhite: makeOutlinedTheme('#fff'),

  // Inverted button themes
  invertedCool: makeSolidTheme(cool, cool, 'inverted'),
  invertedWarm: makeSolidTheme(warm, warm, 'inverted'),
  invertedDark: makeSolidTheme(dark, dark, 'inverted'),
  invertedMid: makeSolidTheme(mid, mid, 'inverted'),
  invertedLight: makeSolidTheme(light, dark, 'inverted'),
  invertedWhite: makeSolidTheme('#fff', dark, 'inverted')
});
