/* Copy and pasted from `./JiraScopingSelectAllIssues.tsx` */
import styled from '@emotion/styled'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useMutationProps from '~/hooks/useMutationProps'
import UpdatePokerScopeMutation from '~/mutations/UpdatePokerScopeMutation'
import Checkbox from './Checkbox'
import useAtmosphere from '../hooks/useAtmosphere'
import graphql from 'babel-plugin-relay/macro'
import {ParabolScopingSelectAllTasks_tasks} from '../__generated__/ParabolScopingSelectAllTasks_tasks.graphql'
import useUnusedRecords from '~/hooks/useUnusedRecords'
import getSelectAllTitle from '../utils/getSelectAllTitle'

const Item = styled('div')({
  display: 'flex',
  paddingLeft: 16
})

const Title = styled('div')({
  paddingLeft: 16,
  paddingBottom: 16,
  fontWeight: 600
})
interface Props {
  meetingId: string
  tasks: ParabolScopingSelectAllTasks_tasks
  usedServiceTaskIds: Set<string>
}

const ParabolScopingSelectAllTasks = (props: Props) => {
  const {meetingId, usedServiceTaskIds, tasks} = props
  const taskIds = tasks.map((taskEdge) => taskEdge.node.id)
  const atmosphere = useAtmosphere()
  const [unusedTasks, allSelected] = useUnusedRecords(tasks, usedServiceTaskIds)
  const {submitting, submitMutation, onCompleted, onError} = useMutationProps()
  const onClick = () => {
    if (submitting) return
    submitMutation()
    const updateArr = allSelected ? Array.from(taskIds) : unusedTasks
    const action = allSelected ? 'DELETE' : 'ADD'
    const updates = updateArr.map(
      (serviceTaskId) =>
        ({
          service: 'PARABOL',
          serviceTaskId,
          action
        } as const)
    )
    const variables = {
      meetingId,
      updates
    }
    UpdatePokerScopeMutation(atmosphere, variables, {onError, onCompleted})
  }
  if (tasks.length < 2) return null
  const title = getSelectAllTitle(tasks.length, usedServiceTaskIds.size, 'task')
  return (
    <Item onClick={onClick}>
      <Checkbox active={allSelected} />
      <Title>{title}</Title>
    </Item>
  )
}

export default createFragmentContainer(ParabolScopingSelectAllTasks, {
  tasks: graphql`
    fragment ParabolScopingSelectAllTasks_tasks on TaskEdge @relay(plural: true) {
      node {
        id
      }
    }
  `
})
