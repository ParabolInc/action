import {EditorState, KeyBindingUtil} from 'draft-js';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import getAnchorLocation from 'universal/components/ProjectEditor/getAnchorLocation';
import getSelectionLink from 'universal/components/ProjectEditor/getSelectionLink';
import getSelectionText from 'universal/components/ProjectEditor/getSelectionText';
import getWordAt from 'universal/components/ProjectEditor/getWordAt';
import AsyncMenuContainer from 'universal/modules/menu/containers/AsyncMenu/AsyncMenu';
import ui from 'universal/styles/ui';
import addSpace from 'universal/utils/draftjs/addSpace';
import getFullLinkSelection from 'universal/utils/draftjs/getFullLinkSelection';
import makeAddLink from 'universal/utils/draftjs/makeAddLink';
import splitBlock from 'universal/utils/draftjs/splitBlock';
import getDraftCoords from 'universal/utils/getDraftCoords';
import linkify from 'universal/utils/linkify';

const fetchEditorLinkChanger = () => System.import('universal/components/EditorLinkChanger/EditorLinkChanger');
const fetchEditorLinkViewer = () => System.import('universal/components/EditorLinkViewer/EditorLinkViewer');

const originAnchor = {
  vertical: 'top',
  horizontal: 'left'
};

const targetAnchor = {
  vertical: 'top',
  horizontal: 'left'
};

const getEntityKeyAtCaret = (editorState) => {
  const selectionState = editorState.getSelection();
  const contentState = editorState.getCurrentContent();
  const anchorOffset = selectionState.getAnchorOffset();
  const blockKey = selectionState.getAnchorKey();
  const block = contentState.getBlockForKey(blockKey);
  return block.getEntityAt(anchorOffset - 1);
};

const getCtrlKSelection = (editorState) => {
  const selectionState = editorState.getSelection();
  if (selectionState.isCollapsed()) {
    const entityKey = getEntityKeyAtCaret(editorState);
    if (entityKey) {
      return getFullLinkSelection(editorState);
    }
    const {block, anchorOffset} = getAnchorLocation(editorState);
    const blockText = block.getText();
    const {word, begin, end} = getWordAt(blockText, anchorOffset - 1);
    if (word) {
      return selectionState.merge({
        anchorOffset: begin,
        focusOffset: end
      });
    }
  }
  return selectionState;
};

const {hasCommandModifier} = KeyBindingUtil;

const withLinks = (ComposedComponent) => {
  return class WithLinks extends Component {
    static propTypes = {
      editorRef: PropTypes.any,
      editorState: PropTypes.object.isRequired,
      handleBeforeInput: PropTypes.func,
      handleChange: PropTypes.func,
      handleKeyCommand: PropTypes.func,
      keyBindingFn: PropTypes.func,
      removeModal: PropTypes.func,
      renderModal: PropTypes.func,
      setEditorState: PropTypes.func.isRequired,
      trackEditingComponent: PropTypes.func.isRequired
    };

    constructor(props) {
      super(props);
      this.state = {};
    }

    getMaybeLinkifiedState = (getNextState, editorState) => {
      this.undoLink = undefined;
      const {block, anchorOffset} = getAnchorLocation(editorState);
      const blockText = block.getText();
      // -1 to remove the link from the current caret state
      const {begin, end, word} = getWordAt(blockText, anchorOffset - 1, true);
      if (!word) return undefined;
      const entityKey = block.getEntityAt(anchorOffset - 1);

      if (entityKey) {
        const contentState = editorState.getCurrentContent();
        const entity = contentState.getEntity(entityKey);
        if (entity.getType() === 'LINK') {
          // the character that is to the left of the caret is a link
          //  const {begin, end, word} = getWordAt(blockText, anchorOffset, true);
          const entityKeyToRight = block.getEntityAt(anchorOffset);
          // if they're putting a space within the link, keep it contiguous
          if (entityKey !== entityKeyToRight) {
            // hitting space should close the modal
            if (this.props.renderModal) {
              this.props.removeModal();
            } else {
              const {linkViewerData, linkChangerData} = this.state;
              if (linkViewerData || linkChangerData) {
                this.removeModal();
              }
            }
            return getNextState();
          }
        }
      } else {
        const links = linkify.match(word);
        // make sure the link starts at the beginning of the word otherwise we get conflicts with markdown and junk
        if (links && links[0].index === 0) {
          const {url} = links[0];
          const linkifier = makeAddLink(block.getKey(), begin, end, url);
          this.undoLink = true;
          // getNextState is a thunk because 99% of the time, we won't ever use it,
          return linkifier(getNextState());
        }
      }
      return undefined;
    };

    // LinkChanger can take focus, so sometimes we don't want to blur
    removeModal = (allowFocus) => {
      const {linkChangerData} = this.state;
      if (!linkChangerData || allowFocus) {
        this.setState({
          linkViewerData: undefined,
          linkChangerData: undefined
        });
      }
    };

    handleBeforeInput = (char) => {
      const {handleBeforeInput, editorState, setEditorState} = this.props;
      if (handleBeforeInput) {
        const result = handleBeforeInput(char);
        if (result === 'handled' || result === true) {
          return result;
        }
      }
      if (char === ' ') {
        const getNextState = () => addSpace(editorState);
        const nextEditorState = this.getMaybeLinkifiedState(getNextState, editorState);
        if (nextEditorState) {
          setEditorState(nextEditorState);
          return 'handled';
        }
      }
      return undefined;
    };

    handleChange = (editorState) => {
      const {handleChange} = this.props;
      const {linkChangerData, linkViewerData} = this.state;
      if (handleChange) {
        handleChange(editorState);
      }
      this.undoLink = undefined;
      const {block, anchorOffset} = getAnchorLocation(editorState);
      const entityKey = block.getEntityAt(anchorOffset - 1);
      if (entityKey && !linkChangerData) {
        const contentState = editorState.getCurrentContent();
        const entity = contentState.getEntity(entityKey);
        if (entity.getType() === 'LINK') {
          this.setState({
            linkViewerData: entity.getData()
          });
          return;
        }
      }
      if (linkViewerData) {
        this.removeModal();
      }
    };

    handleKeyCommand = (command) => {
      const {handleKeyCommand, editorState, setEditorState} = this.props;
      if (handleKeyCommand) {
        const result = handleKeyCommand(command);
        if (result === 'handled' || result === true) {
          return result;
        }
      }

      if (command === 'split-block') {
        const getNextState = () => splitBlock(editorState);
        const nextEditorState = this.getMaybeLinkifiedState(getNextState, editorState);
        if (nextEditorState) {
          setEditorState(nextEditorState);
          return 'handled';
        }
      }

      if (command === 'backspace' && this.undoLink) {
        setEditorState(EditorState.undo(editorState));
        this.undoLink = undefined;
        return 'handled';
      }

      if (command === 'add-hyperlink') {
        this.addHyperlink();
        return 'handled';
      }
      return 'not-handled';
    };

    initialize = () => {
      const {linkViewerData, linkChangerData} = this.state;
      if (linkViewerData || linkChangerData) {
        const renderModal = linkViewerData ? this.renderViewerModal : this.renderChangerModal;
        const {removeModal} = this;
        return {
          renderModal,
          removeModal
        };
      }
      return {};
    };

    keyBindingFn = (e) => {
      const {keyBindingFn} = this.props;
      if (keyBindingFn) {
        const result = keyBindingFn(e);
        if (result) {
          return result;
        }
      }
      if (e.key === 'k' && hasCommandModifier(e)) {
        return 'add-hyperlink';
      }
      return undefined;
    };

    addHyperlink = () => {
      const {editorState} = this.props;
      const selectionState = getCtrlKSelection(editorState);
      const text = getSelectionText(editorState, selectionState);
      const link = getSelectionLink(editorState, selectionState);
      this.setState({
        linkViewerData: undefined,
        linkChangerData: {
          link,
          text,
          selectionState
        }
      });
    };

    renderChangerModal = () => {
      const {linkChangerData} = this.state;
      const {text, link, selectionState} = linkChangerData;
      const {editorState, setEditorState, trackEditingComponent, editorRef} = this.props;
      const coords = getDraftCoords(editorRef);
      // in this case, coords can be good, then bad as soon as the changer takes focus
      // so, the container must handle bad then good as well as good then bad
      if (!coords) {
        setTimeout(() => {
          this.forceUpdate();
        });
      }
      // keys are very important because all modals feed into the same renderModal, which could replace 1 with the other
      return (
        <AsyncMenuContainer
          key="EditorLinkChanger"
          escToClose={false}
          clickToClose={false}
          marginFromOrigin={ui.draftModalMargin}
          fetchMenu={fetchEditorLinkChanger}
          maxWidth={230}
          maxHeight={200}
          originAnchor={originAnchor}
          originCoords={coords}
          queryVars={{
            editorState,
            selectionState,
            setEditorState,
            removeModal: this.removeModal,
            text,
            initialValues: {text, link},
            editorRef
          }}
          targetAnchor={targetAnchor}
          isOpen
          top={this.top}
          left={this.left}
          height={this.height}
          editorState={editorState}
          selectionState={selectionState}
          setEditorState={setEditorState}
          trackEditingComponent={trackEditingComponent}
          removeModal={this.removeModal}
          text={text}
          initialValues={{text, link}}
          editorRef={editorRef}
        />
      );
    };

    renderViewerModal = () => {
      const {linkViewerData} = this.state;
      const {editorRef, editorState, setEditorState} = this.props;

      const coords = getDraftCoords(editorRef);
      if (!coords) {
        setTimeout(() => {
          this.forceUpdate();
        });
      }

      return (
        <AsyncMenuContainer
          key="EditorLinkViewer"
          escToClose={false}
          clickToClose={false}
          marginFromOrigin={ui.draftModalMargin}
          fetchMenu={fetchEditorLinkViewer}
          maxWidth={400}
          maxHeight={100}
          originAnchor={originAnchor}
          originCoords={coords}
          queryVars={{
            editorState,
            setEditorState,
            removeModal: this.removeModal,
            href: linkViewerData.href,
            addHyperlink: this.addHyperlink
          }}
          targetAnchor={targetAnchor}
          isOpen
        />
      );
    };

    render() {
      const modalProps = this.initialize();
      return (<ComposedComponent
        {...this.props}
        {...modalProps}
        handleBeforeInput={this.handleBeforeInput}
        handleChange={this.handleChange}
        handleKeyCommand={this.handleKeyCommand}
        keyBindingFn={this.keyBindingFn}
      />);
    }
  };
};

export default withLinks;
