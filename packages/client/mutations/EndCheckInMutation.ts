import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import onMeetingRoute from '~/utils/onMeetingRoute'
import {EndCheckInMutation_notification} from '~/__generated__/EndCheckInMutation_notification.graphql'
import {EndCheckInMutation_team} from '~/__generated__/EndCheckInMutation_team.graphql'
import {
  HistoryMaybeLocalHandler,
  OnNextHandler,
  OnNextHistoryContext,
  SharedUpdater,
  StandardMutation
} from '../types/relayMutations'
import {EndCheckInMutation as TEndCheckInMutation} from '../__generated__/EndCheckInMutation.graphql'
import handleRemoveSuggestedActions from './handlers/handleRemoveSuggestedActions'
import handleRemoveTasks from './handlers/handleRemoveTasks'
import handleUpsertTasks from './handlers/handleUpsertTasks'
import handleAddTimelineEvent from './handlers/handleAddTimelineEvent'
import {RecordProxy} from 'relay-runtime'
import popEndMeetingToast from './toasts/popEndMeetingToast'

graphql`
  fragment EndCheckInMutation_team on EndCheckInSuccess {
    isKill
    meeting {
      id
      endedAt
      teamId
      agendaItemCount
      commentCount
      taskCount
    }
    removedTaskIds
    team {
      id
      activeMeetings {
        id
      }
      agendaItems {
        id
      }
    }
    timelineEvent {
      id
      team {
        id
        name
      }
      type
    }
    updatedTasks {
      id
      content
      tags
      teamId
      threadId
      threadSource
      meetingId
      updatedAt
      userId
    }
  }
`

graphql`
  fragment EndCheckInMutation_notification on EndCheckInSuccess {
    removedSuggestedActionId
  }
`

const mutation = graphql`
  mutation EndCheckInMutation($meetingId: ID!) {
    endCheckIn(meetingId: $meetingId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...EndCheckInMutation_notification @relay(mask: false)
      ...EndCheckInMutation_team @relay(mask: false)
    }
  }
`
export const endCheckInTeamOnNext: OnNextHandler<EndCheckInMutation_team, OnNextHistoryContext> = (
  payload,
  context
) => {
  const {isKill, meeting} = payload
  const {atmosphere, history} = context
  if (!meeting) return
  const {id: meetingId, teamId} = meeting
  if (onMeetingRoute(window.location.pathname, [meetingId])) {
    if (isKill) {
      history.push(`/team/${teamId}`)
      popEndMeetingToast(atmosphere, meetingId)
    } else {
      history.push(`/new-summary/${meetingId}`)
    }
  }
}

export const endCheckInNotificationUpdater: SharedUpdater<EndCheckInMutation_notification> = (
  payload,
  {store}
) => {
  const removedSuggestedActionId = payload.getValue('removedSuggestedActionId')
  handleRemoveSuggestedActions(removedSuggestedActionId, store)
}

export const endCheckInTeamUpdater: SharedUpdater<EndCheckInMutation_team> = (payload, {store}) => {
  const updatedTasks = payload.getLinkedRecords('updatedTasks')
  const removedTaskIds = payload.getValue('removedTaskIds')
  const meeting = payload.getLinkedRecord('meeting') as RecordProxy
  const timelineEvent = payload.getLinkedRecord('timelineEvent') as RecordProxy
  handleAddTimelineEvent(meeting, timelineEvent, store)
  handleRemoveTasks(removedTaskIds as any, store)
  handleUpsertTasks(updatedTasks as any, store)
}

const EndCheckInMutation: StandardMutation<TEndCheckInMutation, HistoryMaybeLocalHandler> = (
  atmosphere,
  variables,
  {onError, onCompleted, history}
) => {
  return commitMutation<TEndCheckInMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('endCheckIn')
      if (!payload) return
      const context = {atmosphere, store: store as any}
      endCheckInNotificationUpdater(payload as any, context)
      endCheckInTeamUpdater(payload as any, context)
    },
    onCompleted: (res, errors) => {
      if (onCompleted) {
        onCompleted(res, errors)
      }
      endCheckInTeamOnNext(res.endCheckIn as any, {atmosphere, history})
    },
    onError
  })
}

export default EndCheckInMutation
