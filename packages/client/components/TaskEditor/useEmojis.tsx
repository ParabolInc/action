import React, {ReactNode, useRef, useState} from 'react'
import getWordAt from './getWordAt'
import getDraftCoords from '../../utils/getDraftCoords'
import getAnchorLocation from './getAnchorLocation'
import {autoCompleteEmoji} from '../../utils/draftjs/completeEntity'
import EmojiMenuContainer from './EmojiMenuContainer'
import {EditorProps, EditorState} from 'draft-js'
import {SetEditorState} from '../../types/draft'

type Handlers = Pick<EditorProps, 'keyBindingFn' | 'onChange'> & {
  renderModal?: () => ReactNode | null
  removeModal?: () => void
}

interface MenuRef {
  handleKeyDown: (e: React.KeyboardEvent<any>) => 'handled' | 'not-handled'
}

const useEmojis = (
  editorState: EditorState,
  setEditorState: SetEditorState,
  handlers: Handlers
) => {
  const {keyBindingFn, onChange, renderModal, removeModal} = handlers
  const menuRef = useRef<MenuRef>(null)
  const cachedCoordsRef = useRef<ClientRect | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const handleKeyBindingFn: Handlers['keyBindingFn'] = (e) => {
    if (keyBindingFn) {
      const result = keyBindingFn(e)
      if (result) return result
    }
    if (menuRef.current) {
      const handled = menuRef.current.handleKeyDown(e)
      if (handled) return handled
    }
    return null
  }
  const menuItemClickFactory = (emoji: string, editorState: EditorState) => (
    e: React.MouseEvent
  ) => {
    e.preventDefault()
    const nextEditorState = autoCompleteEmoji(editorState, emoji)
    setEditorState(nextEditorState)
  }

  const onRemoveModal = () => {
    setIsOpen(false)
    setQuery('')
  }

  const handleChange = (editorState) => {
    if (onChange) {
      onChange(editorState)
    }
    const {block, anchorOffset} = getAnchorLocation(editorState)
    const blockText = block.getText()
    const entityKey = block.getEntityAt(anchorOffset - 1)
    const {word} = getWordAt(blockText, anchorOffset - 1)

    const inASuggestion = word && !entityKey && word[0] === ':'
    if (inASuggestion) {
      setIsOpen(true)
      setQuery(word.slice(1))
    } else if (isOpen) {
      onRemoveModal()
    }
  }

  const onRenderModal = () => {
    cachedCoordsRef.current = getDraftCoords() || cachedCoordsRef.current
    return (
      <EmojiMenuContainer
        removeModal={onRemoveModal}
        menuItemClickFactory={menuItemClickFactory}
        query={query}
        menuRef={menuRef}
        editorState={editorState}
        originCoords={cachedCoordsRef.current!}
      />
    )
  }
  return {
    onChange: handleChange,
    renderModal: isOpen ? onRenderModal : renderModal,
    removeModal: isOpen ? onRemoveModal : removeModal,
    keyBindingFn: isOpen ? handleKeyBindingFn : keyBindingFn
  }
}

export default useEmojis
