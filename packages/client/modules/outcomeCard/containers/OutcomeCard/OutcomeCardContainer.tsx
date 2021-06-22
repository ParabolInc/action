import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {ContentState, convertToRaw} from 'draft-js'
import React, {memo, useRef, useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import useScrollIntoView from '~/hooks/useScrollIntoVIew'
import {OutcomeCardContainer_task} from '~/__generated__/OutcomeCardContainer_task.graphql'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useEditorState from '../../../../hooks/useEditorState'
import useTaskChildFocus from '../../../../hooks/useTaskChildFocus'
import DeleteTaskMutation from '../../../../mutations/DeleteTaskMutation'
import UpdateTaskMutation from '../../../../mutations/UpdateTaskMutation'
import {AreaEnum, TaskStatusEnum} from '~/__generated__/UpdateTaskMutation.graphql'
import convertToTaskContent from '../../../../utils/draftjs/convertToTaskContent'
import isAndroid from '../../../../utils/draftjs/isAndroid'
import OutcomeCard from '../../components/OutcomeCard/OutcomeCard'

const Wrapper = styled('div')({
  outline: 'none'
})

interface Props {
  area: AreaEnum
  contentState: ContentState
  className?: string
  isAgenda: boolean | undefined
  isDraggingOver: TaskStatusEnum | undefined
  task: OutcomeCardContainer_task
  dataCy: string
}

const OutcomeCardContainer = memo((props: Props) => {
  const {contentState, className, isDraggingOver, task, area, isAgenda, dataCy} = props
  const {id: taskId, team, content} = task
  const {id: teamId} = team
  const atmosphere = useAtmosphere()
  const ref = useRef<HTMLDivElement>(null)
  const [isTaskHovered, setIsTaskHovered] = useState(false)
  const editorRef = useRef<HTMLTextAreaElement>(null)

  const [editorState, setEditorState] = useEditorState(content)
  const {useTaskChild, isTaskFocused} = useTaskChildFocus(taskId)

  const handleCardUpdate = () => {
    const isFocused = isTaskFocused()
    if (isAndroid) {
      const editorEl = editorRef.current
      if (!editorEl || editorEl.type !== 'textarea') return
      const {value} = editorEl
      if (!value && !isFocused) {
        DeleteTaskMutation(atmosphere, taskId, teamId)
      } else {
        const initialContentState = editorState.getCurrentContent()
        const initialText = initialContentState.getPlainText()
        if (initialText === value) return
        const updatedTask = {
          id: taskId,
          content: convertToTaskContent(value)
        }
        UpdateTaskMutation(atmosphere, {updatedTask, area}, {})
      }
      return
    }
    const nextContentState = editorState.getCurrentContent()
    const hasText = nextContentState.hasText()
    if (!hasText && !isFocused) {
      DeleteTaskMutation(atmosphere, taskId, teamId)
    } else {
      const content = JSON.stringify(convertToRaw(nextContentState))
      const initialContent = JSON.stringify(convertToRaw(contentState))
      if (content === initialContent) return
      const updatedTask = {
        id: taskId,
        content
      }
      UpdateTaskMutation(atmosphere, {updatedTask, area}, {})
    }
  }

  useScrollIntoView(ref, !contentState.hasText())
  return (
    <Wrapper
      tabIndex={-1}
      className={className}
      onMouseEnter={() => setIsTaskHovered(true)}
      onMouseLeave={() => setIsTaskHovered(false)}
      ref={ref}
    >
      <OutcomeCard
        dataCy={`${dataCy}-card`}
        area={area}
        editorRef={editorRef}
        editorState={editorState}
        handleCardUpdate={handleCardUpdate}
        isTaskFocused={isTaskFocused()}
        isTaskHovered={isTaskHovered}
        isAgenda={!!isAgenda}
        isDraggingOver={isDraggingOver}
        task={task}
        setEditorState={setEditorState}
        useTaskChild={useTaskChild}
      />
    </Wrapper>
  )
})

export default createFragmentContainer(OutcomeCardContainer, {
  task: graphql`
    fragment OutcomeCardContainer_task on Task {
      editors {
        userId
      }
      content
      id
      team {
        id
      }
      ...OutcomeCard_task
    }
  `
})
