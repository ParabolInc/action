import {EditorState} from 'draft-js'
import React, {ChangeEvent, ClipboardEvent, RefObject, useEffect, useState} from 'react'
import styled from '@emotion/styled'
import TextArea from 'react-textarea-autosize'
import {Card, Gutters} from '../types/constEnums'
import {PALETTE} from '../styles/paletteV3'

interface Props {
  className?: string
  editorState: EditorState
  onBlur?: (e: React.FocusEvent) => void
  onFocus?: (e: React.FocusEvent) => void
  onKeyDown: (e: React.KeyboardEvent) => void
  onPastedText?: (text: string) => void
  placeholder: string
  editorRef: RefObject<HTMLTextAreaElement>
  onChange?: () => void
}

const TextAreaStyles = styled(TextArea)({
  backgroundColor: 'transparent',
  border: 0,
  color: PALETTE.SLATE_700,
  display: 'block',
  fontSize: Card.FONT_SIZE,
  lineHeight: Card.LINE_HEIGHT,
  overflow: 'hidden',
  outline: 0,
  padding: `${Gutters.REFLECTION_INNER_GUTTER_VERTICAL} ${Gutters.REFLECTION_INNER_GUTTER_HORIZONTAL}`,
  resize: 'none',
  width: '100%'
})

const AndroidEditorFallback = (props: Props) => {
  const {className, editorState, onBlur, onFocus, onKeyDown, onPastedText, placeholder, editorRef} = props
  const [value, setValue] = useState('')
  const [height, setHeight] = useState<number | undefined>(44)

  useEffect(() => {
    const currentContent = editorState.getCurrentContent()
    const text = currentContent.getPlainText()
    setValue(text)
  }, [editorState])

  const onChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
  }

  const handlePaste = (e: ClipboardEvent) => {
    if (onPastedText) {
      const clipboardData = e.clipboardData
      const pastedText = clipboardData.getData('Text')
      onPastedText(pastedText)
    }
  }

  return (
    <TextAreaStyles
      className={className}
      onHeightChange={(height) => setHeight(height)}
      style={{height}}
      inputRef={editorRef}
      spellCheck
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      onFocus={onFocus}
      onPaste={handlePaste}
      onKeyDown={onKeyDown}
    />
  )
}

export default AndroidEditorFallback
