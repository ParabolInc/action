import {ContentState} from 'draft-js'
import React, {Component, ReactNode} from 'react'
import {PALETTE} from '../../styles/paletteV3'

const baseStyle = {
  color: PALETTE.SLATE_700
}

interface Props {
  children: ReactNode
  contentState: ContentState
  entityKey: string
  offsetkey: string
}

const EditorLink = (getEditorState) =>
  class InnerEditorLink extends Component<Props> {
    state = {hasFocus: false}

    onClick = (e) => {
      const hasFocus = getEditorState()
        .getSelection()
        .getHasFocus()
      if (hasFocus) return
      e.preventDefault()
      const {contentState, entityKey} = this.props
      const {href} = contentState.getEntity(entityKey).getData()
      window.open(href, '_blank', 'noreferrer')
    }

    onMouseOver = () => {
      const hasFocus = getEditorState()
        .getSelection()
        .getHasFocus()
      if (this.state.hasFocus !== hasFocus) {
        this.setState({hasFocus})
      }
    }

    render() {
      const {offsetkey, children} = this.props
      const {hasFocus} = this.state
      const style = {
        ...baseStyle,
        cursor: hasFocus ? 'text' : 'pointer',
        textDecoration: 'underline'
      }
      return (
        <span
          data-offset-key={offsetkey}
          style={style}
          onMouseOver={this.onMouseOver}
          onMouseDown={this.onClick}
        >
          {children}
        </span>
      )
    }
  }

export default EditorLink
