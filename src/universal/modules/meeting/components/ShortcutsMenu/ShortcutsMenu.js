import React, { Component, PropTypes } from 'react';
import look, { StyleSheet } from 'react-look';
import FontAwesome from 'react-fontawesome';
import theme from 'universal/styles/theme';

const combineStyles = StyleSheet.combineStyles;

const shortcutsKeystrokeHeight = '1.5rem';

const shortcutsRequests = [
  {
    keystroke: 'a',
    definition: 'Add an <b>Action</b> for this request'
  },
  {
    keystroke: 'p',
    definition: 'Add a <b>Project</b> for this request'
  },
  {
    keystroke: '@',
    definition: '<b>Assign</b> to a team member'
  },
  {
    keystroke: 'r',
    definition: 'Mark this request as <b>resolved</b>'
  }
];

let styles = {};

@look
// eslint-disable-next-line react/prefer-stateless-function
export default class ShortcutsMenu extends Component {
  static propTypes = {
    onCloseClick: PropTypes.func
  };

  renderShortcutMenuItem(shortcut, index, array) {
    let itemStyle = null;

    if (index === 0) {
      itemStyle = combineStyles(styles.shortcutsKeystroke, styles.shortcutsKeystrokeIsFirst);
    } else if (index === array.length - 1) {
      itemStyle = combineStyles(styles.shortcutsKeystroke, styles.shortcutsKeystrokeIsLast)
    } else {
      itemStyle = styles.shortcutsItem;
    }

    return (
      <li className={itemStyle} key={index}>
        <span className={styles.shortcutsKeystroke}>{shortcut.keystroke}</span>
        <span className={styles.shortcutsDefinition} dangerouslySetInnerHTML={{__html: shortcut.definition}}></span>
      </li>
    );
  };

  render() {
    const { onCloseClick } = this.props;

    return (
      <div className={styles.shortcutsMenu}>
        <div className={styles.shortcutsLabel}>
          Keyboard Shortcuts
        </div>
        <a className={styles.shortcutsClose} href="#" onClick={onCloseClick} title="Close menu">
          <FontAwesome name="times-circle" />
          <span className={styles.shortcutsCloseLabel}>Close menu</span>
        </a>
        <ul className={styles.shortcutsList}>
          {(() => {
            shortcutsRequests.map((shortcut, index, array) => {
              this.renderShortcutMenuItem(shortcut, index, array);
            });
          })()}
        </ul>
      </div>
    );
  }
}

styles = StyleSheet.create({
  shortcutsMenu: {
    bottom: '2rem',
    color: theme.palette.c,
    position: 'fixed',
    right: '2rem'
  },

  shortcutsLabel: {
    fontSize: theme.typography.fs2,
    fontWeight: 700,
    margin: '0 0 .75rem',
    paddingLeft: '2.5rem',
    textTransform: 'uppercase'
  },

  shortcutsClose: {
    color: theme.palette.c,
    fontSize: theme.typography.fs3,
    position: 'absolute',
    right: 0,
    top: 0,

    // NOTE: ':hover' y ':focus' son igualitos
    ':hover': {
      color: theme.palette.c,
      opacity: .5
    },
    ':focus': {
      color: theme.palette.c,
      opacity: .5
    }
  },

  shortcutsCloseLabel: {
    // TODO: Make mixin for Sass: @include sr-only;
    border: 0,
    clip: 'rect(0, 0, 0, 0)',
    height: '1px',
    margin: '-1px',
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    width: '1px'
  },

  shortcutsList: {
    listStyle: 'none',
    margin: 0,
    padding: 0
  },

  shortcutsItem: {
    display: 'block',
    fontSize: 0
  },

  shortcutsKeystroke: {
    // backgroundColor: mix($theme-d, #fff, 10%),
    backgroundColor: theme.palette.tuBgD10o.bg,
    // borderColor: mix($theme-d, #fff, 40%),
    borderColor: theme.palette.tuBcD40o.bc,
    borderStyle: 'solid',
    borderWidth: '1px 1px 0',
    color: theme.palette.b,
    display: 'inline-block',
    fontSize: theme.typography.fs3,
    fontWeight: 700,
    lineHeight: shortcutsKeystrokeHeight,
    marginRight: '1rem',
    minWidth: shortcutsKeystrokeHeight,
    textAlign: 'center',
    verticalAlign: 'middle'
  },

  shortcutsKeystrokeIsFirst: {
    borderRadius: '.25rem .25rem 0 0'
  },

  shortcutsKeystrokeIsLast: {
    borderRadius: '0 0 .25rem .25rem',
    borderWidth: '1px'
  },

  shortcutsDefinition: {
    borderTop: '1px solid transparent',
    display: 'inline-block',
    fontSize: theme.typography.fs3,
    lineHeight: shortcutsKeystrokeHeight,
    verticalAlign: 'middle'
  }
});
