import {commitMutation} from 'react-relay'
import toTeamMemberId from '../utils/relay/toTeamMemberId'
import graphql from 'babel-plugin-relay/macro'
import {ToggleAgendaListMutation as TToggleAgendaListMutation} from '../__generated__/ToggleAgendaListMutation.graphql'

const mutation = graphql`
  mutation ToggleAgendaListMutation($teamId: ID!) {
    toggleAgendaList(teamId: $teamId) {
      hideAgenda
    }
  }
`

const ToggleAgendaListMutation = (atmosphere, teamId, onError, onCompleted) => {
  const {viewerId} = atmosphere
  return commitMutation<TToggleAgendaListMutation>(atmosphere, {
    mutation,
    variables: {teamId},
    updater: (store) => {
      const payload = store.getRootField('toggleAgendaList')
      if (!payload) return
      const nextValue = payload.getValue('hideAgenda')
      const teamMemberId = toTeamMemberId(teamId, viewerId)
      store.get(teamMemberId)!.setValue(nextValue, 'hideAgenda')
    },
    optimisticUpdater: (store) => {
      const teamMemberId = toTeamMemberId(teamId, viewerId)
      const teamMember = store.get(teamMemberId)!
      const currentValue = teamMember.getValue('hideAgenda') || false
      teamMember.setValue(!currentValue, 'hideAgenda')
    },
    onCompleted,
    onError
  })
}

export default ToggleAgendaListMutation
