import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {HistoryLocalHandler, StandardMutation} from '../types/relayMutations'
import {StartRetrospectiveMutation as TStartRetrospectiveMutation} from '../__generated__/StartRetrospectiveMutation.graphql'

graphql`
  fragment StartRetrospectiveMutation_team on StartRetrospectiveSuccess {
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
  mutation StartRetrospectiveMutation($teamId: ID!) {
    startRetrospective(teamId: $teamId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...StartRetrospectiveMutation_team @relay(mask: false)
    }
  }
`

const StartRetrospectiveMutation: StandardMutation<
  TStartRetrospectiveMutation,
  HistoryLocalHandler
> = (atmosphere, variables, {history, onError, onCompleted}) => {
  return commitMutation<TStartRetrospectiveMutation>(atmosphere, {
    mutation,
    variables,
    onError,
    onCompleted: (res, errors) => {
      onCompleted(res, errors)
      const {startRetrospective} = res
      const {meeting} = startRetrospective
      if (!meeting) return
      const {id: meetingId} = meeting
      history.push(`/meet/${meetingId}`)
    }
  })
}

export default StartRetrospectiveMutation
