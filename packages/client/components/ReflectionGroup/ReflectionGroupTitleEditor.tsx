import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {RefObject, useRef} from 'react'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import useAtmosphere from '../../hooks/useAtmosphere'
import useMutationProps from '../../hooks/useMutationProps'
import UpdateReflectionGroupTitleMutation from '../../mutations/UpdateReflectionGroupTitleMutation'
import {PALETTE} from '../../styles/paletteV3'
import ui from '../../styles/ui'
import {Card} from '../../types/constEnums'
import {RETRO_TOPIC_LABEL} from '../../utils/constants'
import {ReflectionGroupTitleEditor_meeting} from '../../__generated__/ReflectionGroupTitleEditor_meeting.graphql'
import {ReflectionGroupTitleEditor_reflectionGroup} from '../../__generated__/ReflectionGroupTitleEditor_reflectionGroup.graphql'
import StyledError from '../StyledError'

interface Props {
  isExpanded: boolean
  reflectionGroup: ReflectionGroupTitleEditor_reflectionGroup
  readOnly: boolean
  meeting: ReflectionGroupTitleEditor_meeting
  titleInputRef: RefObject<HTMLInputElement>
}

const fontSize = Card.FONT_SIZE
const lineHeight = Card.LINE_HEIGHT

const underlineStyles = {
  backgroundColor: 'transparent',
  borderLeftColor: 'transparent !important',
  borderRightColor: 'transparent !important',
  borderTopColor: 'transparent !important',
  boxShadow: 'none !important'
} as any

const InputWithIconWrap = styled('div')({
  alignItems: 'center',
  display: 'flex'
})

const RootBlock = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 1,
  maxWidth: '100%'
})

const FormBlock = styled('form')({
  display: 'flex',
  flexShrink: 1,
  maxWidth: '100%'
})

// This is gonna turn into slate, no use in spending time fixing it now
const NameInput = styled('input')<{isExpanded: boolean; readOnly: boolean}>(
  ({isExpanded, readOnly}) => ({
    ...underlineStyles,
    ':hover,:focus,:active': {
      underlineStyles
    },
    ...ui.fieldBaseStyles,
    ...ui.fieldSizeStyles.small,
    border: 0,
    boxShadow: 'none',
    color: isExpanded ? '#FFFFFF' : PALETTE.SLATE_700,
    cursor: readOnly ? 'default' : 'text',
    fontSize,
    fontWeight: 600,
    lineHeight,
    padding: 0,
    // need to use a content editable if we wanna animate this since input el forces width
    // card width is set at REFLECTION_WIDTH, so this can be a PX, too
    textAlign: 'left',
    width: 172,
    transition: 'all 200ms'
  })
)

const getValidationError = (title: string | null, reflectionGroups, reflectionGroupId) => {
  if (!title || title.length < 1) {
    return 'Enter a title'
  }
  const usedTitles = reflectionGroups
    .filter((group) => group.id !== reflectionGroupId)
    .map((group) => group.title)
  if (usedTitles.includes(title)) {
    return 'You already used that name'
  }
  return undefined
}

const ReflectionGroupTitleEditor = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {submitMutation, submitting, onCompleted, onError, error} = useMutationProps()
  const {meeting, reflectionGroup, titleInputRef, isExpanded, readOnly} = props
  const {reflectionGroups} = meeting
  const {id: reflectionGroupId, title} = reflectionGroup
  const dirtyRef = useRef(false)
  const initialTitleRef = useRef(title)

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    commitLocalUpdate(atmosphere, (store) => {
      const reflectionGroup = store.get(reflectionGroupId)
      if (!reflectionGroup) return
      reflectionGroup.setValue(title, 'title')
    })
    if (!dirtyRef.current) return
    const normalizedTitle = title.trim()
    const validationError = getValidationError(
      normalizedTitle,
      reflectionGroups,
      reflectionGroupId
    )
    if (!validationError) {
      if (error) {
        onCompleted()
      }
    } else {
      onError(new Error(validationError))
    }
  }

  const onSubmit = (e: React.FormEvent<HTMLInputElement | HTMLFormElement>) => {
    e.preventDefault()
    if (submitting || title === initialTitleRef.current || !title) return
    initialTitleRef.current = title
    // validate
    dirtyRef.current = true
    const normalizedTitle = title.trim()
    const validationError = getValidationError(normalizedTitle, reflectionGroups, reflectionGroupId)
    if (validationError) {
      onError(new Error(validationError))
      return
    }
    titleInputRef.current?.blur()
    submitMutation()
    UpdateReflectionGroupTitleMutation(
      atmosphere,
      {title: normalizedTitle, reflectionGroupId},
      {onError, onCompleted}
    )
  }

  const onKeyPress = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter' || e.shiftKey) return
    e.preventDefault()
    onSubmit(e as any)
  }

  return (
    <InputWithIconWrap>
      <RootBlock data-cy='group-title-editor'>
        <FormBlock onSubmit={onSubmit}>
          <NameInput
            data-cy='group-title-editor-input'
            isExpanded={isExpanded}
            onBlur={onSubmit}
            onChange={onChange}
            onKeyPress={onKeyPress}
            placeholder={RETRO_TOPIC_LABEL}
            readOnly={readOnly}
            ref={titleInputRef}
            maxLength={200}
            type='text'
            value={title || ''}
          />
        </FormBlock>
        {error && <StyledError>{error.message}</StyledError>}
      </RootBlock>
    </InputWithIconWrap>
  )
}

export default createFragmentContainer(
  ReflectionGroupTitleEditor,
  {
    reflectionGroup: graphql`
      fragment ReflectionGroupTitleEditor_reflectionGroup on RetroReflectionGroup {
        id
        title
      }
    `,
    meeting: graphql`
      fragment ReflectionGroupTitleEditor_meeting on RetrospectiveMeeting {
        reflectionGroups {
          id
          title
        }
      }
    `
  }
)
