import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {StandardMutation} from '../types/relayMutations'
import {
  SetCheckInEnabledMutationResponse,
  SetCheckInEnabledMutation as TSetCheckInEnabledMutation
} from '../__generated__/SetCheckInEnabledMutation.graphql'
import {NewMeetingPhaseTypeEnum} from '~/__generated__/ActionMeeting_meeting.graphql'

graphql`
  fragment SetCheckInEnabledMutation_team on SetCheckInEnabledPayload {
    settings {
      phaseTypes
    }
  }
`

const mutation = graphql`
  mutation SetCheckInEnabledMutation($settingsId: ID!, $isEnabled: Boolean!) {
    setCheckInEnabled(settingsId: $settingsId, isEnabled: $isEnabled) {
      ...SetCheckInEnabledMutation_team @relay(mask: false)
    }
  }
`

type Settings = NonNullable<SetCheckInEnabledMutationResponse['setCheckInEnabled']['settings']>

const SetCheckInEnabledMutation: StandardMutation<TSetCheckInEnabledMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TSetCheckInEnabledMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    optimisticUpdater: (store) => {
      const {isEnabled, settingsId} = variables
      const settings = store.get<Settings>(settingsId)
      if (!settings) return
      // relay
      const phaseTypes = settings.getValue('phaseTypes').slice() as NewMeetingPhaseTypeEnum[]
      if (isEnabled && !phaseTypes.includes('checkin')) {
        phaseTypes.unshift('checkin')
      } else if (!isEnabled && phaseTypes.includes('checkin')) {
        phaseTypes.splice(
          phaseTypes.findIndex((type) => type === 'checkin'),
          1
        )
      }
      settings.setValue(phaseTypes, 'phaseTypes')
    }
  })
}

export default SetCheckInEnabledMutation
