import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {HistoryLocalHandler, StandardMutation} from '../types/relayMutations'
import {StartCheckInMutation as TStartCheckInMutation} from '../__generated__/StartCheckInMutation.graphql'

graphql`
  fragment StartCheckInMutation_team on StartCheckInSuccess {
    meeting {
      id
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
  mutation StartCheckInMutation($teamId: ID!) {
    startCheckIn(teamId: $teamId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...StartCheckInMutation_team @relay(mask: false)
    }
  }
`

const StartCheckInMutation: StandardMutation<TStartCheckInMutation, HistoryLocalHandler> = (
  atmosphere,
  variables,
  {history, onError, onCompleted}
) => {
  return commitMutation<TStartCheckInMutation>(atmosphere, {
    mutation,
    variables,
    onError,
    onCompleted: (res, errors) => {
      onCompleted(res, errors)
      const {startCheckIn} = res
      const {meeting} = startCheckIn
      if (!meeting) return
      const {id: meetingId} = meeting
      history.push(`/meet/${meetingId}`)
    }
  })
}

export default StartCheckInMutation
