/**
 * The reflection card presentational component.
 *
 * @flow
 */
// $FlowFixMe
import {EditorState, ContentState} from 'draft-js';
import React, {Component} from 'react';
import styled, {css} from 'react-emotion';

import EditorInputWrapper from 'universal/components/EditorInputWrapper';
import ReflectionCardWrapper from 'universal/components/ReflectionCardWrapper/ReflectionCardWrapper';
import editorDecorators from 'universal/components/TaskEditor/decorators';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';

import ReflectionCardDeleteButton from './ReflectionCardDeleteButton';

export type Props = {|
  // The draft-js content for this card
  contentState: ContentState,
  // The action to take when this card is deleted
  handleDelete?: () => any,
  // The action to take when this card is saved
  handleSave?: (editorState: EditorState) => any,
  // A hook for any effects to perform when the user "starts editing" this card e.g. it gains focus
  handleStartEditing?: () => any,
  // A hook for any effects to perform when the user "stops editing" this card e.g. it loses focus
  handleStopEditing?: () => any,
  // True when this card is being hovered over by a valid drag source
  hovered?: boolean,
  // True when the current user is the one dragging this card
  iAmDragging?: boolean,
  // The unique ID of this reflection card
  id: string,
  // Whether we're "collapsed" e.g. in a stack of cards.  This allows us to truncate to a constant height,
  // Simplifying style computations.
  isCollapsed?: boolean,
  // Provided by react-dnd
  isDragging?: boolean,
  // States whether it serves as a drag preview.
  pulled?: boolean,
  // The display name of the phase in which this reflection was created, e.g. "What's working?"
  reflectionPhaseQuestion?: ?string,
  // The name of the user who is currently dragging this card to a new place, if any
  userDragging?: string,
|};

type State = {
  editorState: EditorState,
  mouseOver: boolean
};

type DnDStylesWrapperProps = {
  hovered?: boolean,
  pulled?: boolean,
  iAmDragging?: boolean
};

const CardLabel = styled('div')({
  alignItems: 'flex-start',
  color: ui.palette.midGray,
  display: 'flex',
  fontSize: '.8125rem',
  justifyContent: 'space-between',
  padding: '0 .75rem .5rem'
});

const DnDStylesWrapper = styled('div')(({pulled, iAmDragging}: DnDStylesWrapperProps) => ({
  opacity: ((iAmDragging && !pulled)) && 0.6
}));

export default class ReflectionCard extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      confirmingDelete: false,
      editorState: EditorState.createWithContent(
        props.contentState,
        editorDecorators(this.getEditorState)
      ),
      mouseOver: false
    };
  }

  getEditorState = () => (
    this.state.editorState
  );

  setEditorState = (editorState: EditorState) => {
    this.setState({editorState});
  };

  canDelete = () => (
    Boolean(this.props.handleDelete)
  );

  delete = () => {
    if (this.props.handleDelete) {
      this.props.handleDelete();
    }
  };

  handleEditorBlur = () => {
    const {handleSave, handleStopEditing} = this.props;
    if (handleSave) {
      handleSave(this.getEditorState());
    }
    if (handleStopEditing) {
      handleStopEditing();
    }
  };

  handleEditorFocus = () => {
    const {handleStartEditing} = this.props;
    if (handleStartEditing) {
      handleStartEditing();
    }
  };

  saveDeleteButton = (deleteButton: ?HTMLButtonElement) => {
    this.deleteButton = deleteButton;
  };

  deleteButton: ?HTMLButtonElement;

  maybeRenderDelete = () => {
    const {mouseOver} = this.state;
    return this.canDelete() && (
      <ReflectionCardDeleteButton
        innerRef={this.saveDeleteButton}
        isVisible={mouseOver}
        onBlur={() => this.setState({mouseOver: false})}
        onClick={this.delete}
        onFocus={() => this.setState({mouseOver: true})}
      />
    );
  };

  maybeRenderReflectionPhaseQuestion = () => {
    const {isCollapsed, reflectionPhaseQuestion} = this.props;
    return !isCollapsed && reflectionPhaseQuestion && <CardLabel>{reflectionPhaseQuestion}</CardLabel>;
  };

  maybeRenderUserDragging = () => {
    const {isDragging, pulled, userDragging} = this.props;
    const styles = {
      color: appTheme.palette.warm,
      textAlign: 'end'
    };
    return (isDragging && !pulled) && (
      <div className={css(styles)}>
        {userDragging}
      </div>
    );
  };

  handleMouseEnter = () => {
    this.setState({mouseOver: true});
  };

  handleMouseLeave = () => {
    this.setState({mouseOver: false});
  };

  renderCardContent = () => {
    const {handleSave, isCollapsed} = this.props;
    const {editorState} = this.state;
    const styles: Object = {
      maxHeight: '10rem',
      overflow: 'auto',
      padding: '.75rem'
    };
    if (isCollapsed) {
      styles.height = `${ui.retroCardCollapsedHeightRem}rem`;
      styles.overflow = 'hidden';
    }
    return (
      <div className={css(styles)}>
        {handleSave ? (
          <EditorInputWrapper
            ariaLabel="Edit this reflection"
            editorState={editorState}
            handleReturn={() => 'not-handled'}
            onBlur={this.handleEditorBlur}
            onFocus={this.handleEditorFocus}
            placeholder="My reflection thought..."
            setEditorState={this.setEditorState}
          />
        ) : (
          <EditorInputWrapper
            editorState={editorState}
            readOnly
          />
        )}
      </div>
    );
  };

  render() {
    const {hovered, iAmDragging, pulled, userDragging} = this.props;
    const holdingPlace = Boolean(userDragging && !pulled);
    return (
      <DnDStylesWrapper pulled={pulled} iAmDragging={iAmDragging} hovered={hovered}>
        {this.maybeRenderUserDragging()}
        <ReflectionCardWrapper
          holdingPlace={holdingPlace}
          hoveringOver={hovered}
          pulled={pulled}
          onMouseEnter={this.handleMouseEnter}
          onMouseLeave={this.handleMouseLeave}
        >
          {this.renderCardContent()}
          {this.maybeRenderReflectionPhaseQuestion()}
          {this.maybeRenderDelete()}
        </ReflectionCardWrapper>
      </DnDStylesWrapper>
    );
  }
}
