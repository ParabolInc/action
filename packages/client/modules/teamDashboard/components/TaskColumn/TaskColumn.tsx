import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {Component} from 'react'
import {Droppable, DroppableProvided, DroppableStateSnapshot} from 'react-beautiful-dnd'
import {createFragmentContainer} from 'react-relay'
import {TaskColumn_teams} from '~/__generated__/TaskColumn_teams.graphql'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../../../decorators/withAtmosphere/withAtmosphere'
import {PALETTE} from '../../../../styles/paletteV3'
import {BezierCurve, DroppableType} from '../../../../types/constEnums'
import {TEAM_DASH, USER_DASH} from '../../../../utils/constants'
import {taskStatusLabels} from '../../../../utils/taskStatus'
import {TaskColumn_tasks} from '../../../../__generated__/TaskColumn_tasks.graphql'
import {AreaEnum, TaskStatusEnum} from '~/__generated__/UpdateTaskMutation.graphql'
import TaskColumnAddTask from './TaskColumnAddTask'
import TaskColumnInner from './TaskColumnInner'

const Column = styled('div')<{isDragging: boolean}>(({isDragging}) => ({
  background: isDragging ? PALETTE.SLATE_300 : undefined,
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  position: 'relative',
  transition: `background 300ms ${BezierCurve.DECELERATE}`
}))

const ColumnHeader = styled('div')({
  color: PALETTE.SLATE_700,
  display: 'flex !important',
  lineHeight: '24px',
  padding: 12,
  position: 'relative'
})

const ColumnBody = styled('div')({
  flex: 1,
  height: '100%',
  overflowX: 'hidden',
  overflowY: 'auto',
  minHeight: 200,
  paddingBottom: 8
})

const StatusLabel = styled('div')({
  fontWeight: 600,
  textTransform: 'capitalize'
})

const TasksCount = styled('div')({
  color: PALETTE.SLATE_500,
  marginLeft: 8
})

const StatusLabelBlock = styled('div')<{userCanAdd: boolean | undefined}>(({userCanAdd}) => ({
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  fontSize: 16,
  marginLeft: userCanAdd ? 8 : 16
}))

interface Props extends WithAtmosphereProps {
  area: AreaEnum
  isMyMeetingSection?: boolean
  meetingId?: string
  myTeamMemberId?: string
  tasks: TaskColumn_tasks
  status: TaskStatusEnum
  teamMemberFilterId?: string | null
  teams: TaskColumn_teams | null
}

class TaskColumn extends Component<Props> {
  render() {
    const {
      area,
      isMyMeetingSection,
      meetingId,
      myTeamMemberId,
      teamMemberFilterId,
      status,
      tasks,
      teams
    } = this.props
    const label = taskStatusLabels[status]
    const userCanAdd = area === TEAM_DASH || area === USER_DASH || isMyMeetingSection
    return (
      <Droppable droppableId={status} type={DroppableType.TASK}>
        {(dropProvided: DroppableProvided, dropSnapshot: DroppableStateSnapshot) => (
          <Column isDragging={dropSnapshot.isDraggingOver}>
            <ColumnHeader>
              <TaskColumnAddTask
                area={area}
                isMyMeetingSection={isMyMeetingSection}
                status={status}
                tasks={tasks}
                meetingId={meetingId}
                myTeamMemberId={myTeamMemberId}
                teamMemberFilterId={teamMemberFilterId || ''}
                teams={teams}
              />
              <StatusLabelBlock userCanAdd={userCanAdd}>
                <StatusLabel>{label}</StatusLabel>
                {tasks.length > 0 && <TasksCount>{tasks.length}</TasksCount>}
              </StatusLabelBlock>
            </ColumnHeader>
            <ColumnBody {...dropProvided.droppableProps} ref={dropProvided.innerRef}>
              <TaskColumnInner area={area} tasks={tasks} />
              {dropProvided.placeholder}
            </ColumnBody>
          </Column>
        )}
      </Droppable>
    )
  }
}

export default createFragmentContainer(withAtmosphere(TaskColumn), {
  tasks: graphql`
    fragment TaskColumn_tasks on Task @relay(plural: true) {
      ...TaskColumnAddTask_tasks
      ...TaskColumnInner_tasks
      id
    }
  `,
  teams: graphql`
    fragment TaskColumn_teams on Team @relay(plural: true) {
      ...TaskColumnAddTask_teams
    }
  `
})
