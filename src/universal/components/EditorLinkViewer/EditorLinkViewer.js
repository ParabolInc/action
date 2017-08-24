import {css} from 'aphrodite-local-styles/no-important';
import React, {Component} from 'react';
import Button from 'universal/components/Button/Button';
import removeLink from 'universal/utils/draftjs/removeLink';
import {textOverflow} from 'universal/styles/helpers';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import PropTypes from 'prop-types';

const dontTellDraft = (e) => {
  e.preventDefault();
  e.stopPropagation();
};


class EditorLinkViewer extends Component {
  render() {
    const {
      href,
      styles,
      addHyperlink,
      setRef
    } = this.props;

    const menuStyles = css(
      styles.modal,
    );

    const handleRemove = () => {
      const {editorState, setEditorState, removeModal} = this.props;
      setEditorState(removeLink(editorState));
      removeModal();
    };

    const changeLink = () => {
      addHyperlink();
    };

    return (
      <div className={menuStyles} onMouseDown={dontTellDraft} ref={setRef}>
        <span className={css(styles.url)}>
          <a className={css(styles.linkText)} href={href} rel="noopener noreferrer" target="_blank">{href}</a>
        </span>
        <Button buttonStyle="flat" size="smallest" colorPalette="cool" label="Change" onClick={changeLink} />
        <Button buttonStyle="flat" size="smallest" colorPalette="cool" label="Remove" onClick={handleRemove} />
      </div>
    );
  }
}

EditorLinkViewer.propTypes = {
  addHyperlink: PropTypes.func.isRequired,
  href: PropTypes.string,
  editorState: PropTypes.object,
  isClosing: PropTypes.bool,
  left: PropTypes.number,
  removeModal: PropTypes.func.isRequired,
  setEditorState: PropTypes.func.isRequired,
  setRef: PropTypes.func,
  styles: PropTypes.object,
  top: PropTypes.number
};

const styleThunk = () => ({
  modal: {
    alignItems: 'center',
    color: ui.palette.dark,
    display: 'flex',
    fontSize: appTheme.typography.s5
  },

  url: {
    ...textOverflow,
    alignItems: 'center',
    borderRight: `1px solid ${ui.cardBorderColor}`,
    display: 'flex',
    flexShrink: 2,
    fontSize: appTheme.typography.s3,
    height: '100%',
    marginRight: '.25rem',
    padding: '.75rem'
  },

  linkText: {
    ...textOverflow,
    marginRight: '0.5rem',
    maxWidth: '20rem'
  }
});

export default withStyles(styleThunk)(EditorLinkViewer);
