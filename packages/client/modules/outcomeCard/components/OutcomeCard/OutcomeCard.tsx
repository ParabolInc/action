import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {EditorState} from 'draft-js'
import React, {memo, RefObject} from 'react'
import {createFragmentContainer} from 'react-relay'
import EditingStatus from '~/components/EditingStatus/EditingStatus'
import {OutcomeCard_task} from '~/__generated__/OutcomeCard_task.graphql'
import TaskEditor from '../../../../components/TaskEditor/TaskEditor'
import TaskIntegrationLink from '../../../../components/TaskIntegrationLink'
import TaskWatermark from '../../../../components/TaskWatermark'
import useTaskChildFocus, {UseTaskChild} from '../../../../hooks/useTaskChildFocus'
import {cardFocusShadow, cardHoverShadow, cardShadow, Elevation} from '../../../../styles/elevation'
import cardRootStyles from '../../../../styles/helpers/cardRootStyles'
import {Card} from '../../../../types/constEnums'
import {AreaEnum, TaskServiceEnum, TaskStatusEnum} from '~/__generated__/UpdateTaskMutation.graphql'
import isTaskArchived from '../../../../utils/isTaskArchived'
import isTaskPrivate from '../../../../utils/isTaskPrivate'
import isTempId from '../../../../utils/relay/isTempId'
import {taskStatusLabels} from '../../../../utils/taskStatus'
import TaskFooter from '../OutcomeCardFooter/TaskFooter'
import OutcomeCardStatusIndicator from '../OutcomeCardStatusIndicator/OutcomeCardStatusIndicator'

const RootCard = styled('div')<{
  isTaskHovered: boolean
  isTaskFocused: boolean
  isDragging: boolean
}>(({isTaskHovered, isTaskFocused, isDragging}) => ({
  ...cardRootStyles,
  borderTop: 0,
  outline: 'none',
  padding: `${Card.PADDING} 0 0`,
  transition: `box-shadow 100ms ease-in`,
  // hover before focus, it matters
  boxShadow: isDragging
    ? Elevation.CARD_DRAGGING
    : isTaskFocused
    ? cardFocusShadow
    : isTaskHovered
    ? cardHoverShadow
    : cardShadow
}))

const ContentBlock = styled('div')({
  position: 'relative'
})

const StatusIndicatorBlock = styled('div')({
  display: 'flex'
})

const TaskEditorWrapper = styled('div')()

interface Props {
  area: AreaEnum
  isTaskFocused: boolean
  isTaskHovered: boolean
  editorRef: RefObject<HTMLTextAreaElement>
  editorState: EditorState
  handleCardUpdate: () => void
  isAgenda: boolean
  isDraggingOver: TaskStatusEnum | undefined
  task: OutcomeCard_task
  setEditorState: (newEditorState: EditorState) => void
  useTaskChild: UseTaskChild
  dataCy: string
}

const OutcomeCard = memo((props: Props) => {
  const {
    area,
    isTaskFocused,
    isTaskHovered,
    editorRef,
    editorState,
    handleCardUpdate,
    isAgenda,
    isDraggingOver,
    task,
    setEditorState,
    useTaskChild,
    dataCy
  } = props
  const isPrivate = isTaskPrivate(task.tags)
  const isArchived = isTaskArchived(task.tags)
  const {integration, status, taskId, team} = task
  const {addTaskChild, removeTaskChild} = useTaskChildFocus(taskId)
  const {teamId} = team
  const service = integration ? (integration.service as TaskServiceEnum) : undefined
  const statusTitle = `Card status: ${taskStatusLabels[status]}`
  const privateTitle = ', marked as #private'
  const archivedTitle = ', set as #archived'
  const statusIndicatorTitle = `${statusTitle}${isPrivate ? privateTitle : ''}${
    isArchived ? archivedTitle : ''
  }`

  return (
    <RootCard
      isTaskHovered={isTaskHovered}
      isTaskFocused={isTaskFocused}
      isDragging={!!isDraggingOver}
    >
      <TaskWatermark service={service} />
      <ContentBlock>
        <EditingStatus
          isTaskHovered={isTaskHovered}
          isArchived={isArchived}
          task={task}
          useTaskChild={useTaskChild}
        >
          <StatusIndicatorBlock data-cy={`${dataCy}-status`} title={statusIndicatorTitle}>
            <OutcomeCardStatusIndicator status={isDraggingOver || status} />
            {isPrivate && <OutcomeCardStatusIndicator status='private' />}
            {isArchived && <OutcomeCardStatusIndicator status='archived' />}
          </StatusIndicatorBlock>
        </EditingStatus>
        <TaskEditorWrapper
          onBlur={() => {
            removeTaskChild('root')
            setTimeout(handleCardUpdate)
          }}
          onFocus={() => addTaskChild('root')}
        >
          <TaskEditor
            dataCy={`${dataCy}`}
            editorRef={editorRef}
            editorState={editorState}
            readOnly={Boolean(isTempId(taskId) || isArchived || isDraggingOver || service)}
            setEditorState={setEditorState}
            teamId={teamId}
            useTaskChild={useTaskChild}
          />
        </TaskEditorWrapper>
        <TaskIntegrationLink dataCy={`${dataCy}`} integration={integration || null} />
        <TaskFooter
          dataCy={`${dataCy}`}
          area={area}
          cardIsActive={isTaskFocused || isTaskHovered}
          editorState={editorState}
          isAgenda={isAgenda}
          task={task}
          useTaskChild={useTaskChild}
        />
      </ContentBlock>
    </RootCard>
  )
})

export default createFragmentContainer(OutcomeCard, {
  task: graphql`
    fragment OutcomeCard_task on Task {
      taskId: id
      integration {
        service
        ...TaskIntegrationLink_integration
      }
      status
      tags
      team {
        teamId: id
      }
      # grab userId to ensure sorting on connections works
      userId
      ...EditingStatus_task
      ...TaskFooter_task
    }
  `
})
