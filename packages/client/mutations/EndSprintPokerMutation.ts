import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import onMeetingRoute from '~/utils/onMeetingRoute'
import {EndSprintPokerMutation_team} from '~/__generated__/EndSprintPokerMutation_team.graphql'
import {
  HistoryMaybeLocalHandler,
  OnNextHandler,
  OnNextHistoryContext,
  SharedUpdater,
  StandardMutation
} from '../types/relayMutations'
import {EndSprintPokerMutation as TEndSprintPokerMutation} from '../__generated__/EndSprintPokerMutation.graphql'
import handleRemoveTasks from './handlers/handleRemoveTasks'
import popEndMeetingToast from './toasts/popEndMeetingToast'

graphql`
  fragment EndSprintPokerMutation_team on EndSprintPokerSuccess {
    isKill
    meeting {
      id
      endedAt
      teamId
    }
    team {
      id
      activeMeetings {
        id
      }
    }
    removedTaskIds
  }
`

const mutation = graphql`
  mutation EndSprintPokerMutation($meetingId: ID!) {
    endSprintPoker(meetingId: $meetingId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...EndSprintPokerMutation_team @relay(mask: false)
    }
  }
`

export const endSprintPokerTeamOnNext: OnNextHandler<
  EndSprintPokerMutation_team,
  OnNextHistoryContext
> = (payload, context) => {
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

export const endSprintPokerTeamUpdater: SharedUpdater<EndSprintPokerMutation_team> = (
  payload,
  {store}
) => {
  const removedTaskIds = payload.getValue('removedTaskIds')
  handleRemoveTasks(removedTaskIds as any, store)
}

const EndSprintPokerMutation: StandardMutation<
  TEndSprintPokerMutation,
  HistoryMaybeLocalHandler
> = (atmosphere, variables, {onError, onCompleted, history}) => {
  return commitMutation<TEndSprintPokerMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('endSprintPoker')
      if (!payload) return
      const context = {atmosphere, store: store as any}
      endSprintPokerTeamUpdater(payload as any, context)
    },
    onCompleted: (res, errors) => {
      if (onCompleted) {
        onCompleted(res, errors)
      }
      endSprintPokerTeamOnNext(res.endSprintPoker as any, {atmosphere, history})
    },
    onError
  })
}

export default EndSprintPokerMutation
