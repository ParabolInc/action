import graphql from 'babel-plugin-relay/macro'
import useEmailItemGrid from 'parabol-client/hooks/useEmailItemGrid'
import {PALETTE} from 'parabol-client/styles/paletteV3'
import {FONT_FAMILY} from 'parabol-client/styles/typographyV2'
import {TaskSummarySection_tasks} from 'parabol-client/__generated__/TaskSummarySection_tasks.graphql'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import EmailTaskCard from './EmailTaskCard'

interface Props {
  label: string
  tasks: TaskSummarySection_tasks | null
}

const taskTypeStyle = {
  color: PALETTE.SLATE_700,
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontSize: 14,
  fontWeight: 600,
  paddingBottom: 16,
  paddingTop: 24
}

const TaskSummarySection = (props: Props) => {
  const {label, tasks} = props
  const grid = useEmailItemGrid(tasks || [], 3, 2)
  if (!tasks || !tasks.length) return null
  return (
    <>
      <tr>
        <td align='center' style={taskTypeStyle}>
          {label}
        </td>
      </tr>
      <tr>
        <td>
          {grid((task) => (
            <EmailTaskCard key={task.id} task={task} />
          ))}
        </td>
      </tr>
    </>
  )
}

export default createFragmentContainer(TaskSummarySection, {
  tasks: graphql`
    fragment TaskSummarySection_tasks on Task @relay(plural: true) {
      ...EmailTaskCard_task
    }
  `
})
