import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {convertToRaw} from 'draft-js'
import React, {useEffect, useRef} from 'react'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import AddReactjiToReactableMutation from '~/mutations/AddReactjiToReactableMutation'
import {
  NewMeetingPhaseTypeEnum,
  ReflectionCard_meeting
} from '~/__generated__/ReflectionCard_meeting.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import useEditorState from '../../hooks/useEditorState'
import useMutationProps from '../../hooks/useMutationProps'
import EditReflectionMutation from '../../mutations/EditReflectionMutation'
import RemoveReflectionMutation from '../../mutations/RemoveReflectionMutation'
import UpdateReflectionContentMutation from '../../mutations/UpdateReflectionContentMutation'
import convertToTaskContent from '../../utils/draftjs/convertToTaskContent'
import isAndroid from '../../utils/draftjs/isAndroid'
import isPhaseComplete from '../../utils/meetings/isPhaseComplete'
import isTempId from '../../utils/relay/isTempId'
import {ReflectionCard_reflection} from '../../__generated__/ReflectionCard_reflection.graphql'
import ReflectionEditorWrapper from '../ReflectionEditorWrapper'
import StyledError from '../StyledError'
import ColorBadge from './ColorBadge'
import ReactjiSection from './ReactjiSection'
import ReflectionCardDeleteButton from './ReflectionCardDeleteButton'
import ReflectionCardRoot from './ReflectionCardRoot'

const StyledReacjis = styled(ReactjiSection)({
  padding: '0 14px 12px'
})

interface Props {
  isClipped?: boolean
  reflection: ReflectionCard_reflection
  meeting: ReflectionCard_meeting | null
  stackCount?: number
  showOriginFooter?: boolean
  showReactji?: boolean
  dataCy?: string
}

const getReadOnly = (
  reflection: {id: string; isViewerCreator: boolean | null; isEditing: boolean | null},
  phaseType: NewMeetingPhaseTypeEnum,
  stackCount: number | undefined,
  phases: any | null
) => {
  const {isViewerCreator, isEditing, id} = reflection
  if (phases && isPhaseComplete('group', phases)) return true
  if (!isViewerCreator || isTempId(id)) return true
  if (phaseType === 'reflect') return stackCount && stackCount > 1
  if (phaseType === 'group' && isEditing) return false
  return true
}

const ReflectionCard = (props: Props) => {
  const {meeting, reflection, isClipped, stackCount, showReactji, dataCy} = props
  const {meetingId, reactjis} = reflection
  const phaseType = meeting ? meeting.localPhase.phaseType : null
  const phases = meeting ? meeting.phases : null
  const {id: reflectionId, content, promptId, isViewerCreator} = reflection
  const atmosphere = useAtmosphere()
  const {onCompleted, submitting, submitMutation, error, onError} = useMutationProps()
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const [editorState, setEditorState] = useEditorState(content)

  const handleEditorFocus = () => {
    if (isTempId(reflectionId)) return
    EditReflectionMutation(atmosphere, {isEditing: true, meetingId, promptId})
  }

  const updateIsEditing = (isEditing: boolean) => {
    commitLocalUpdate(atmosphere, (store) => {
      const reflection = store.get(reflectionId)
      if (!reflection) return
      reflection.setValue(isEditing, 'isEditing')
    })
  }

  useEffect(() => {
    if (isViewerCreator && !editorState.getCurrentContent().hasText()) {
      updateIsEditing(true)
    }
    return () => updateIsEditing(false)
  }, [])

  const handleContentUpdate = () => {
    if (isAndroid) {
      const editorEl = editorRef.current
      if (!editorEl || editorEl.type !== 'textarea') return
      const {value} = editorEl
      if (!value) {
        RemoveReflectionMutation(atmosphere, {reflectionId}, {meetingId, onError, onCompleted})
      } else {
        const initialContentState = editorState.getCurrentContent()
        const initialText = initialContentState.getPlainText()
        if (initialText === value) return
        submitMutation()
        UpdateReflectionContentMutation(
          atmosphere,
          {content: convertToTaskContent(value), reflectionId},
          {onError, onCompleted}
        )
        commitLocalUpdate(atmosphere, (store) => {
          const reflection = store.get(reflectionId)
          if (!reflection) return
          reflection.setValue(false, 'isEditing')
        })
      }
      return
    }
    const contentState = editorState.getCurrentContent()
    if (contentState.hasText()) {
      const nextContent = JSON.stringify(convertToRaw(contentState))
      if (content === nextContent) return
      submitMutation()
      UpdateReflectionContentMutation(
        atmosphere,
        {content: nextContent, reflectionId},
        {onError, onCompleted}
      )
      commitLocalUpdate(atmosphere, (store) => {
        const reflection = store.get(reflectionId)
        if (!reflection) return
        reflection.setValue(false, 'isEditing')
      })
    } else {
      submitMutation()
      RemoveReflectionMutation(atmosphere, {reflectionId}, {meetingId, onError, onCompleted})
    }
  }

  const handleEditorBlur = () => {
    if (isTempId(reflectionId)) return
    handleContentUpdate()
    EditReflectionMutation(atmosphere, {isEditing: false, meetingId, promptId})
  }

  const handleReturn = (e) => {
    if (e.shiftKey) return 'not-handled'
    editorRef.current && editorRef.current.blur()
    return 'handled'
  }

  const handleKeyDownFallback = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      editorRef.current && editorRef.current.blur()
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const {value} = e.currentTarget
      if (!value) return
      editorRef.current && editorRef.current.blur()
    }
  }

  const readOnly = getReadOnly(reflection, phaseType as NewMeetingPhaseTypeEnum, stackCount, phases)
  const userSelect = readOnly ? (phaseType === 'discuss' ? 'text' : 'none') : undefined

  const onToggleReactji = (emojiId: string) => {
    if (submitting) return
    const isRemove = !!reactjis.find((reactji) => {
      return reactji.isViewerReactji && reactji.id.split(':')[1] === emojiId
    })
    submitMutation()
    AddReactjiToReactableMutation(
      atmosphere,
      {
        reactableId: reflectionId,
        reactableType: 'REFLECTION',
        isRemove,
        reactji: emojiId,
        meetingId
      },
      {onCompleted, onError}
    )
  }

  const clearError = () => {
    onCompleted()
  }
  return (
    <ReflectionCardRoot data-cy={`${dataCy}-root`}>
      <ColorBadge phaseType={phaseType as NewMeetingPhaseTypeEnum} reflection={reflection} />
      <ReflectionEditorWrapper
        dataCy={`editor-wrapper`}
        isClipped={isClipped}
        ariaLabel='Edit this reflection'
        editorRef={editorRef}
        editorState={editorState}
        onBlur={handleEditorBlur}
        onFocus={handleEditorFocus}
        handleReturn={handleReturn}
        handleKeyDownFallback={handleKeyDownFallback}
        placeholder={isViewerCreator ? 'My reflection… (press enter to add)' : '*New Reflection*'}
        readOnly={readOnly}
        setEditorState={setEditorState}
        userSelect={userSelect}
      />
      {error && <StyledError onClick={clearError}>{error.message}</StyledError>}
      {!readOnly && (
        <ReflectionCardDeleteButton
          dataCy={`reflection-delete`}
          meetingId={meetingId}
          reflectionId={reflectionId}
        />
      )}
      {showReactji && <StyledReacjis reactjis={reactjis} onToggle={onToggleReactji} />}
    </ReflectionCardRoot>
  )
}

export default createFragmentContainer(ReflectionCard, {
  reflection: graphql`
    fragment ReflectionCard_reflection on RetroReflection {
      ...ColorBadge_reflection
      isViewerCreator
      id
      isEditing
      meetingId
      reflectionGroupId
      promptId
      content
      reactjis {
        ...ReactjiSection_reactjis
        id
        isViewerReactji
      }
      sortOrder
    }
  `,
  meeting: graphql`
    fragment ReflectionCard_meeting on RetrospectiveMeeting {
      id
      localPhase {
        phaseType
      }
      phases {
        phaseType
        stages {
          id
          isComplete
        }
      }
    }
  `
})
