import styled from '@emotion/styled'
import {
  DraftEditorCommand,
  DraftHandleValue,
  Editor,
  EditorProps,
  EditorState,
  getDefaultKeyBinding
} from 'draft-js'
import React, {RefObject, Suspense, useEffect, useRef} from 'react'
import completeEntity from '~/utils/draftjs/completeEntity'
import linkify from '~/utils/linkify'
import {UseTaskChild} from '../../hooks/useTaskChildFocus'
import {Card} from '../../types/constEnums'
import {textTags} from '../../utils/constants'
import entitizeText from '../../utils/draftjs/entitizeText'
import isAndroid from '../../utils/draftjs/isAndroid'
import isRichDraft from '../../utils/draftjs/isRichDraft'
import lazyPreload from '../../utils/lazyPreload'
import blockStyleFn from './blockStyleFn'
import './Draft.css'
import useTaskPlugins from './useTaskPlugins'

const RootEditor = styled('div')<{noText: boolean; readOnly: boolean | undefined}>(
  ({noText, readOnly}) => ({
    cursor: readOnly ? undefined : 'text',
    fontSize: Card.FONT_SIZE,
    lineHeight: Card.LINE_HEIGHT,
    padding: `0 ${Card.PADDING}`,
    height: noText ? '2.75rem' : undefined // Use this if the placeholder wraps
  })
)

const AndroidEditorFallback = lazyPreload(() =>
  import(/* webpackChunkName: 'AndroidEditorFallback' */ '../AndroidEditorFallback')
)

const TaskEditorFallback = styled(AndroidEditorFallback)({
  padding: 0
})

type DraftProps = Pick<
  EditorProps,
  | 'editorState'
  | 'handleBeforeInput'
  | 'handleKeyCommand'
  | 'handleReturn'
  | 'keyBindingFn'
  | 'readOnly'
>

interface Props extends DraftProps {
  editorRef: RefObject<HTMLTextAreaElement>
  setEditorState: (newEditorState: EditorState) => void
  teamId: string
  useTaskChild: UseTaskChild
  dataCy: string
  className?: string
}

const TaskEditor = (props: Props) => {
  const {editorRef, editorState, readOnly, setEditorState, dataCy, className} = props
  const entityPasteStartRef = useRef<{anchorOffset: number; anchorKey: string} | undefined>()
  const {
    removeModal,
    renderModal,
    handleChange,
    handleBeforeInput,
    handleKeyCommand,
    keyBindingFn,
    handleReturn
  } = useTaskPlugins({...props})

  useEffect(() => {
    if (!editorState.getCurrentContent().hasText()) {
      editorRef.current && editorRef.current.focus()
    }
  }, [])

  const onRemoveModal = () => {
    if (removeModal) {
      removeModal()
    }
  }

  const onChange = (editorState: EditorState) => {
    const {current: entityPasteStart} = entityPasteStartRef
    if (entityPasteStart) {
      const {anchorOffset, anchorKey} = entityPasteStart
      const selectionState = editorState.getSelection().merge({
        anchorOffset,
        anchorKey
      })
      const contentState = entitizeText(editorState.getCurrentContent(), selectionState)
      entityPasteStartRef.current = undefined
      if (contentState) {
        setEditorState(EditorState.push(editorState, contentState, 'apply-entity'))
        return
      }
    }
    if (!editorState.getSelection().getHasFocus()) {
      onRemoveModal()
    } else if (handleChange) {
      handleChange(editorState)
    }
    setEditorState(editorState)
  }

  const onReturn = (e) => {
    if (handleReturn) {
      return handleReturn(e, editorState)
    }
    if (!e.shiftKey && !renderModal) {
      editorRef.current && editorRef.current.blur()
      return 'handled'
    }
    return 'not-handled'
  }

  const onKeyDownFallback = (e) => {
    if (e.key !== 'Enter' || e.shiftKey) return
    e.preventDefault()
    editorRef.current && editorRef.current.blur()
  }

  const nextKeyCommand = (command: DraftEditorCommand) => {
    if (handleKeyCommand) {
      return handleKeyCommand(command, editorState, Date.now())
    }
    return 'not-handled'
  }

  const onKeyBindingFn = (e) => {
    if (keyBindingFn) {
      const result = keyBindingFn(e)
      if (result) {
        return result
      }
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      onRemoveModal()
      return 'not-handled'
    }
    return getDefaultKeyBinding(e)
  }

  const onBeforeInput = (char: string) => {
    if (handleBeforeInput) {
      return handleBeforeInput(char, editorState, Date.now())
    }
    return 'not-handled'
  }

  const onPastedText = (text: string): DraftHandleValue => {
    if (text) {
      for (let i = 0; i < textTags.length; i++) {
        const tag = textTags[i]
        if (text.indexOf(tag) !== -1) {
          const selection = editorState.getSelection()
          entityPasteStartRef.current = {
            anchorOffset: selection.getAnchorOffset(),
            anchorKey: selection.getAnchorKey()
          }
        }
      }
    }
  const links = linkify.match(text)
  const url = links && links[0].url.trim()
  const trimmedText = text.trim()    
    if (url === trimmedText){
      const nextEditorState = completeEntity(editorState, 'LINK', {href: url}, trimmedText, {
      keepSelection: true
    })
    setEditorState(nextEditorState)
    return 'handled'
  }
    return 'not-handled'
  }

  const noText = !editorState.getCurrentContent().hasText()
  const placeholder = 'Describe what “Done” looks like'
  const useFallback = isAndroid && !readOnly
  const showFallback =  useFallback && !isRichDraft(editorState)
  return (
    <RootEditor data-cy={`${dataCy}-editor`} noText={noText} readOnly={readOnly} className={className}>
      {showFallback ? (
        <Suspense fallback={<div />}>
          <TaskEditorFallback
            editorState={editorState}
            placeholder={placeholder}
            onKeyDown={onKeyDownFallback}
            onPastedText={onPastedText}
            editorRef={editorRef}
          />
        </Suspense>
      ) : (
        <Editor
          spellCheck
          blockStyleFn={blockStyleFn}
          editorState={editorState}
          handleBeforeInput={onBeforeInput}
          handleKeyCommand={nextKeyCommand}
          handlePastedText={onPastedText}
          handleReturn={onReturn}
          keyBindingFn={onKeyBindingFn}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={readOnly || (useFallback && !showFallback)}
          ref={editorRef as any}
        />
      )}
      {renderModal && renderModal()}
    </RootEditor>
  )
}

export default TaskEditor
