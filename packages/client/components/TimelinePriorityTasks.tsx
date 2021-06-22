import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useMemo} from 'react'
import {DragDropContext, Droppable, DroppableProvided, DropResult} from 'react-beautiful-dnd'
import {createFragmentContainer} from 'react-relay'
import DraggableTask from '../containers/TaskCard/DraggableTask'
import withAtmosphere, {WithAtmosphereProps} from '../decorators/withAtmosphere/withAtmosphere'
import useAtmosphere from '../hooks/useAtmosphere'
import useEventCallback from '../hooks/useEventCallback'
import UpdateTaskMutation from '../mutations/UpdateTaskMutation'
import {PALETTE} from '../styles/paletteV3'
import {ICON_SIZE} from '../styles/typographyV2'
import {DroppableType} from '../types/constEnums'
import {ACTIVE, SORT_STEP} from '../utils/constants'
import dndNoise from '../utils/dndNoise'
import {TimelinePriorityTasks_viewer} from '../__generated__/TimelinePriorityTasks_viewer.graphql'
import Icon from './Icon'
import TimelineNoTasks from './TimelineNoTasks'

interface Props extends WithAtmosphereProps {
  viewer: TimelinePriorityTasks_viewer
}

const PriorityTasksHeader = styled('div')({
  background: PALETTE.SLATE_200,
  color: PALETTE.SLATE_600,
  fontSize: 14,
  fontWeight: 600,
  paddingTop: 16,
  paddingBottom: 16,
  top: 0,
  zIndex: 2
})

const ActiveIcon = styled(Icon)({
  fontSize: ICON_SIZE.MD18,
  verticalAlign: 'bottom',
  marginRight: 4
})

const TaskList = styled('div')({
  paddingTop: 8
})

const PriorityTaskBody = styled('div')({
  width: '100%'
})

const TimelinePriorityTasks = (props: Props) => {
  const {viewer} = props
  const {tasks} = viewer
  const atmosphere = useAtmosphere()
  const activeTasks = useMemo(() => {
    const {edges} = tasks
    const nodes = edges.map((edge) => edge.node)
    return nodes
      .filter((node) => node.status === ACTIVE)
      .sort((a, b) => (a.sortOrder < b.sortOrder ? 1 : -1))
    // try checking for length in case relay is screwing up & not invalidating (repro: sometimes cypress fails)
  }, [tasks, tasks.edges.length])

  const onDragEnd = useEventCallback((result: DropResult) => {
    const {source, destination, draggableId} = result
    if (!destination) return
    if (destination.index === source.index) return

    let sortOrder
    if (destination.index === 0) {
      sortOrder = dndNoise()
    } else if (destination.index === activeTasks.length) {
      sortOrder = activeTasks[activeTasks.length - 1].sortOrder - SORT_STEP + dndNoise()
    } else {
      const offset = source.index > destination.index ? -1 : 1
      sortOrder =
        (activeTasks[destination.index + offset].sortOrder +
          activeTasks[destination.index].sortOrder) /
        2 +
        dndNoise()
    }
    const updatedTask = {id: draggableId, sortOrder}
    UpdateTaskMutation(atmosphere, {updatedTask, area: 'userDash'}, {})
  })

  if (activeTasks.length === 0) return <TimelineNoTasks />
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId='active' type={DroppableType.TASK}>
        {(dropProvided: DroppableProvided) => (
          <TaskList>
            <PriorityTasksHeader>
              <ActiveIcon>whatshot</ActiveIcon>
              Active Tasks
            </PriorityTasksHeader>
            <PriorityTaskBody {...dropProvided.droppableProps} ref={dropProvided.innerRef}>
              {activeTasks.map((task, idx) => (
                <DraggableTask key={task.id} area='userDash' task={task} idx={idx} />
              ))}
              {dropProvided.placeholder}
            </PriorityTaskBody>
          </TaskList>
        )}
      </Droppable>
    </DragDropContext>
  )
}

export default createFragmentContainer(withAtmosphere(TimelinePriorityTasks), {
  viewer: graphql`
    fragment TimelinePriorityTasks_viewer on User {
      tasks(first: 1000, userIds: $userIds) @connection(key: "UserColumnsContainer_tasks") {
        __typename
        edges {
          node {
            id
            content @__clientField(handle: "contentText")
            contentText
            status
            sortOrder
            team {
              id
            }
            ...DraggableTask_task
          }
        }
      }
    }
  `
})
