import {EditorState, SelectionState} from 'draft-js'
import React, {RefObject, useEffect} from 'react'
import styled from '@emotion/styled'
import RaisedButton from '../RaisedButton'
import {PALETTE} from '../../styles/paletteV3'
import completeEntity from '../../utils/draftjs/completeEntity'
import linkify from '../../utils/linkify'
import withForm, {WithFormProps} from '../../utils/relay/withForm'
import Legitity from '../../validation/Legitity'
import BasicInput from '../InputField/BasicInput'
import {UseTaskChild} from '../../hooks/useTaskChildFocus'
import {BBox} from '../../types/animations'
import {MenuPosition} from '../../hooks/useCoords'
import useMenu from '../../hooks/useMenu'

const ModalBoundary = styled('div')({
  color: PALETTE.SLATE_700,
  padding: '.5rem .5rem .5rem 1rem',
  minWidth: '20rem',
  outline: 0
})

const TextBlock = styled('div')({
  // use baseline so errors don't bump it off center
  alignItems: 'top',
  display: 'flex',
  marginBottom: '.5rem'
})

const InputBlock = styled('div')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column'
})

const InputLabel = styled('span')({
  display: 'block',
  fontSize: 15,
  fontWeight: 600,
  lineHeight: '40px',
  marginRight: '.5rem'
})

const ButtonBlock = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end'
})

interface Props extends WithFormProps {
  editorState: EditorState
  editorRef: RefObject<HTMLTextAreaElement>

  link: string | null

  originCoords: BBox
  removeModal(allowFocus: boolean): void

  selectionState: SelectionState

  setEditorState(editorState: EditorState): void

  text: string | null

  useTaskChild: UseTaskChild
}

const EditorLinkChanger = (props: Props) => {
  const {
    editorState,
    editorRef,
    originCoords,
    removeModal,
    selectionState,
    setEditorState,
    setDirtyField,
    validateField,
    link,
    fields,
    onChange,
    text,
    useTaskChild
  } = props
  useTaskChild('editor-link-changer')
  const {menuPortal, openPortal} = useMenu(MenuPosition.UPPER_LEFT, {
    isDropdown: true,
    originCoords
  })
  useEffect(openPortal, [])
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setDirtyField()
    const {link: linkRes, text: textRes} = validateField()
    if (linkRes.error || textRes.error) return
    const link = linkRes.value as string
    const text = textRes.value as string
    const href = linkify.match(link)[0].url
    removeModal(true)
    const focusedEditorState = EditorState.forceSelection(editorState, selectionState)
    const nextEditorState = completeEntity(focusedEditorState, 'LINK', {href}, text, {
      keepSelection: true
    })
    setEditorState(nextEditorState)
    setTimeout(() => editorRef.current && editorRef.current.focus(), 0)
  }

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as any)) {
      removeModal(true)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      removeModal(true)
      setTimeout(() => editorRef.current && editorRef.current.focus(), 0)
    }
  }

  const hasError = !!(fields.text.error || fields.link.error)
  const label = text ? 'Update' : 'Add'
  return menuPortal(
    <ModalBoundary onBlur={handleBlur} onKeyDown={handleKeyDown} tabIndex={-1}>
      <form onSubmit={onSubmit}>
        {text !== null && (
          <TextBlock>
            <InputLabel>{'Text'}</InputLabel>
            <InputBlock>
              <BasicInput {...fields.text} onChange={onChange} autoFocus name='text' />
            </InputBlock>
          </TextBlock>
        )}
        <TextBlock>
          <InputLabel>{'Link'}</InputLabel>
          <InputBlock>
            <BasicInput
              {...fields.link}
              value={fields.link.value === null ? '' : fields.link.value}
              autoFocus={link === null && text !== ''}
              onChange={onChange}
              name='link'
              spellCheck={false}
            />
          </InputBlock>
        </TextBlock>
        <ButtonBlock>
          <RaisedButton disabled={hasError} onClick={onSubmit} palette='mid'>
            {label}
          </RaisedButton>
        </ButtonBlock>
      </form>
    </ModalBoundary>
  )
}

const form = withForm({
  text: {
    getDefault: ({text}) => text,
    validate: (value) =>
      new Legitity(value)
        .trim()
        .required()
        .min(1, 'Maybe give it a name?')
        .max(100, 'That name is looking pretty long')
  },
  link: {
    getDefault: ({link}) => link,
    validate: (value) =>
      new Legitity(value).test((maybeUrl) => {
        if (!maybeUrl) return 'No link provided'
        const links = linkify.match(maybeUrl)
        return !links ? 'Not looking too linky' : undefined
      })
  }
})

export default form(EditorLinkChanger)
