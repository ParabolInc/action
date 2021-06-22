import PropTypes from 'prop-types'
import React, {Component} from 'react'
import getWordAt from './getWordAt'
import getDraftCoords from '../../utils/getDraftCoords'
import getAnchorLocation from './getAnchorLocation'
import {autoCompleteEmoji} from '../../utils/draftjs/completeEntity'
import EmojiMenuContainer from './EmojiMenuContainer'

const withEmojis = (ComposedComponent) => {
  class WithEmojis extends Component<any> {
    cachedCoords: any
    static propTypes = {
      editorState: PropTypes.object.isRequired,
      handleChange: PropTypes.func,
      keyBindingFn: PropTypes.func,
      // could be readOnly, so not strictly required
      setEditorState: PropTypes.func
    }

    state = {
      isOpen: false,
      query: ''
    }

    keyBindingFn = (e) => {
      const {keyBindingFn} = this.props
      if (keyBindingFn) {
        const result = keyBindingFn(e)
        if (result) return result
      }
      if (this.menuRef.current) {
        const handled = this.menuRef.current.handleKeyDown(e)
        if (handled) return handled
      }
      return undefined
    }

    menuRef = React.createRef<any>()

    menuItemClickFactory = (emoji, editorState) => (e) => {
      e.preventDefault()
      const {setEditorState} = this.props
      const nextEditorState = autoCompleteEmoji(editorState, emoji)
      setEditorState(nextEditorState)
    }

    removeModal = () => {
      this.setState({
        isOpen: false,
        query: ''
      })
    }

    handleChange = (editorState) => {
      const {handleChange} = this.props
      if (handleChange) {
        handleChange(editorState)
      }
      const {block, anchorOffset} = getAnchorLocation(editorState)
      const blockText = block.getText()
      const entityKey = block.getEntityAt(anchorOffset - 1)
      const {word} = getWordAt(blockText, anchorOffset - 1)

      const inASuggestion = word && !entityKey && word[0] === ':'
      if (inASuggestion) {
        this.setState({
          isOpen: true,
          query: word.slice(1)
        })
      } else if (this.state.isOpen) {
        this.removeModal()
      }
    }

    initialize = () => {
      const {isOpen} = this.state
      if (isOpen) {
        const {renderModal, removeModal, keyBindingFn} = this
        return {renderModal, removeModal, keyBindingFn}
      }
      return {}
    }

    renderModal = () => {
      const {query} = this.state
      const {editorState} = this.props
      this.cachedCoords = getDraftCoords() || this.cachedCoords
      return (
        <EmojiMenuContainer
          removeModal={this.removeModal}
          menuItemClickFactory={this.menuItemClickFactory}
          query={query}
          menuRef={this.menuRef}
          editorState={editorState}
          originCoords={this.cachedCoords}
        />
      )
    }

    render() {
      return (
        <ComposedComponent
          {...this.props}
          {...this.initialize()}
          handleChange={this.handleChange}
        />
      )
    }
  }
  return WithEmojis as any
}

export default withEmojis
