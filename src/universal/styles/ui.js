
// ui.js
// NOTE: Just normalizing some UI style properties here. (TA)

import tinycolor from 'tinycolor2';
import theme from 'universal/styles/theme';

const backgroundColor = tinycolor.mix(theme.palette.mid, '#fff', 95).toHexString();

const ui = {
  // Action cards
  actionCardBgColor: theme.palette.light60l,
  actionCardBgActive: 'rgba(255, 255, 255, .85)',

  // Cards
  cardBorderColor: theme.palette.mid30l,
  cardBorderRadius: '.25rem',
  cardMinHeight: '7.5rem',
  cardPaddingBase: '.5rem',

  // Dashboards
  dashBackgroundColor: backgroundColor,
  dashBorderColor: 'rgba(0, 0, 0, .1)',
  dashGutter: '1rem',
  dashSectionHeaderLineHeight: '1.875rem',

  // Icons
  iconSize: '14px', // FontAwesome base
  iconSize2x: '28px', // FontAwesome 2x

  // Menus
  menuBackgroundColor: backgroundColor,

  // Project columns
  projectColumnsMaxWidth: '80rem',
  projectColumnsMinWidth: '48rem'
};

export default ui;
