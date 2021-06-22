import {TaskFooter_task} from '../../../../__generated__/TaskFooter_task.graphql'
import {EditorState} from 'draft-js'
import React from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import CardButton from '../../../../components/CardButton'
import IconLabel from '../../../../components/IconLabel'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import TaskFooterIntegrateToggle from './TaskFooterIntegrateToggle'
import TaskFooterTagMenuToggle from './TaskFooterTagMenuToggle'
import TaskFooterTeamAssignee from './TaskFooterTeamAssignee'
import TaskFooterUserAssignee from './TaskFooterUserAssignee'
import OutcomeCardMessage from '../OutcomeCardMessage/OutcomeCardMessage'
import {USER_DASH} from '../../../../utils/constants'
import removeContentTag from '../../../../utils/draftjs/removeContentTag'
import isTaskArchived from '../../../../utils/isTaskArchived'
import {AreaEnum} from '~/__generated__/UpdateTaskMutation.graphql'
import {Card} from '../../../../types/constEnums'
import {UseTaskChild} from '../../../../hooks/useTaskChildFocus'
import useMutationProps from '../../../../hooks/useMutationProps'
import setLocalTaskError from '../../../../utils/relay/setLocalTaskError'

const Footer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  maxWidth: '100%',
  padding: `12px ${Card.PADDING} ${Card.PADDING}`
})

const ButtonGroup = styled('div')<{cardIsActive: boolean}>(({cardIsActive}) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  opacity: cardIsActive ? 1 : 0
}))

// ButtonSpacer helps truncated names (…) be consistent
const ButtonSpacer = styled('div')({
  display: 'inline-block',
  height: 24,
  verticalAlign: 'middle',
  width: 24
})

const AvatarBlock = styled('div')({
  flex: 1,
  height: 24,
  minWidth: 0
})

interface Props {
  area: AreaEnum
  cardIsActive: boolean
  editorState: EditorState
  isAgenda: boolean
  task: TaskFooter_task
  useTaskChild: UseTaskChild
  dataCy: string
}

const TaskFooter = (props: Props) => {
  const {area, cardIsActive, editorState, isAgenda, task, useTaskChild, dataCy} = props
  const {onCompleted, onError, submitMutation, submitting} = useMutationProps()
  const handleError = (err: Error) => {
    onError(err)
    if (err.message) {
      setLocalTaskError(atmosphere, taskId, err.message)
    }
  }
  const handleCompleted = (res, errors) => {
    onCompleted(res, errors)
    const payload = res?.[Object.keys(res)[0]]
    const error = payload?.error?.message ?? errors?.[0]?.message ?? null
    setLocalTaskError(atmosphere, taskId, error)
  }

  const mutationProps = {
    onCompleted: handleCompleted,
    submitMutation,
    submitting,
    onError: handleError
  }
  const atmosphere = useAtmosphere()
  const showTeam = area === USER_DASH
  const {content, id: taskId, error, integration, tags, userId} = task
  const isArchived = isTaskArchived(tags)
  const canAssign = !integration && !isArchived
  return (
    <React.Fragment>
      <Footer>
        <AvatarBlock>
          {showTeam ? (
            <TaskFooterTeamAssignee canAssign={canAssign} task={task} useTaskChild={useTaskChild} />
          ) : (
            <TaskFooterUserAssignee
              area={area}
              canAssign={canAssign}
              cardIsActive={cardIsActive}
              task={task}
              useTaskChild={useTaskChild}
            />
          )}
        </AvatarBlock>
        <ButtonGroup cardIsActive={cardIsActive}>
          {integration || isArchived || !userId ? (
            <ButtonSpacer />
          ) : (
            <TaskFooterIntegrateToggle
              dataCy={`${dataCy}-integration`}
              mutationProps={mutationProps}
              task={task}
              useTaskChild={useTaskChild}
            />
          )}
          {isArchived ? (
            <CardButton
              onClick={() => removeContentTag('archived', atmosphere, taskId, content, area)}
            >
              <IconLabel icon='reply' />
            </CardButton>
          ) : (
            <TaskFooterTagMenuToggle
              dataCy={`${dataCy}-tag`}
              area={area}
              editorState={editorState}
              isAgenda={isAgenda}
              task={task}
              useTaskChild={useTaskChild}
              mutationProps={mutationProps}
            />
          )}
        </ButtonGroup>
      </Footer>
      {error && <OutcomeCardMessage onClose={handleCompleted} message={error} />}
    </React.Fragment>
  )
}

export default createFragmentContainer(TaskFooter, {
  task: graphql`
    fragment TaskFooter_task on Task {
      id
      content
      error
      integration {
        service
      }
      tags
      team {
        id
      }
      userId
      ...TaskFooterTeamAssignee_task
      ...TaskFooterUserAssignee_task
      ...TaskFooterTagMenu_task
      ...TaskFooterIntegrateMenuRoot_task
    }
  `
})
