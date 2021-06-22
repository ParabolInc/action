import {GraphQLID, GraphQLNonNull} from 'graphql'
import EndDraggingReflectionPayload from '../types/EndDraggingReflectionPayload'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import isPhaseComplete from 'parabol-client/utils/meetings/isPhaseComplete'
import DragReflectionDropTargetTypeEnum from '../types/DragReflectionDropTargetTypeEnum'
import addReflectionToGroup from './helpers/updateReflectionLocation/addReflectionToGroup'
import removeReflectionFromGroup from './helpers/updateReflectionLocation/removeReflectionFromGroup'
import standardError from '../../utils/standardError'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'

type TDragReflectionDropTargetTypeEnum = 'REFLECTION_GRID' | 'REFLECTION_GROUP'
export default {
  description: 'Broadcast that the viewer stopped dragging a reflection',
  type: EndDraggingReflectionPayload,
  args: {
    reflectionId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    dropTargetType: {
      description:
        'if it was a drop (isDragging = false), the type of item it was dropped on. null if there was no valid drop target',
      type: DragReflectionDropTargetTypeEnum
    },
    dropTargetId: {
      description:
        'if dropTargetType could refer to more than 1 component, this ID defines which one',
      type: GraphQLID
    },
    dragId: {
      description: 'the ID of the drag to connect to the start drag event',
      type: GraphQLID
    }
  },
  async resolve(
    _source,
    {
      reflectionId,
      dropTargetType,
      dropTargetId,
      dragId
    }: {
      reflectionId: string
      dropTargetType: TDragReflectionDropTargetTypeEnum
      dropTargetId: string
      dragId: string
    },
    context
  ) {
    const {authToken, dataLoader, socketId: mutatorId} = context
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}

    // AUTH
    const viewerId = getUserId(authToken)
    const reflection = await dataLoader.get('retroReflections').load(reflectionId)
    if (!reflection) {
      return standardError(new Error('Reflection not found'), {userId: viewerId})
    }
    const {meetingId, reflectionGroupId: oldReflectionGroupId} = reflection
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    if (!meeting) return standardError(new Error('Meeting not found'), {userId: viewerId})
    const {endedAt, phases, teamId} = meeting
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }
    if (endedAt) return standardError(new Error('Meeting already ended'), {userId: viewerId})
    if (isPhaseComplete('group', phases)) {
      return standardError(new Error('Meeting phase already completed'), {userId: viewerId})
    }

    // RESOLUTION
    let newReflectionGroupId
    if (dropTargetType === 'REFLECTION_GRID') {
      // ungroup
      try {
        newReflectionGroupId = await removeReflectionFromGroup(reflectionId, context)
      } catch (e) {
        return standardError(e, {userId: viewerId})
      }
    } else if (dropTargetType === 'REFLECTION_GROUP' && dropTargetId) {
      // group
      try {
        newReflectionGroupId = await addReflectionToGroup(reflectionId, dropTargetId, context)
      } catch (e) {
        return standardError(e, {userId: viewerId})
      }
    }
    const data = {
      meetingId,
      reflectionId,
      reflectionGroupId: newReflectionGroupId,
      oldReflectionGroupId,
      userId: viewerId,
      dropTargetType,
      dropTargetId,
      remoteDrag: {
        id: dragId,
        dragUserId: viewerId
      }
    }

    publish(
      SubscriptionChannel.MEETING,
      meetingId,
      'EndDraggingReflectionPayload',
      data,
      subOptions
    )
    return data
  }
}
