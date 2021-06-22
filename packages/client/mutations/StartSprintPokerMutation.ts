import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {HistoryLocalHandler, StandardMutation} from '../types/relayMutations'
import {StartSprintPokerMutation as TStartSprintPokerMutation} from '../__generated__/StartSprintPokerMutation.graphql'

graphql`
  fragment StartSprintPokerMutation_team on StartSprintPokerSuccess {
    meeting {
      id
      createdBy
      name
      meetingMembers {
        user {
          id
          preferredName
        }
      }
    }
    team {
      ...TopBarMeetingsActiveMeetings @relay(mask: false)
      lastMeetingType
    }
  }
`

const mutation = graphql`
  mutation StartSprintPokerMutation($teamId: ID!) {
    startSprintPoker(teamId: $teamId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...StartSprintPokerMutation_team @relay(mask: false)
    }
  }
`

const StartSprintPokerMutation: StandardMutation<TStartSprintPokerMutation, HistoryLocalHandler> = (
  atmosphere,
  variables,
  {history, onError, onCompleted}
) => {
  return commitMutation<TStartSprintPokerMutation>(atmosphere, {
    mutation,
    variables,
    onError,
    onCompleted: (res, errors) => {
      onCompleted(res, errors)
      const {startSprintPoker} = res
      const {meeting} = startSprintPoker
      if (!meeting) return
      const {id: meetingId} = meeting
      history.push(`/meet/${meetingId}`)
    }
  })
}

export default StartSprintPokerMutation
