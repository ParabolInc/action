import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {SharedUpdater, StandardMutation} from '../types/relayMutations'
import getInProxy from '../utils/relay/getInProxy'
import {RemovePokerTemplateMutation as TRemovePokerTemplateMutation} from '../__generated__/RemovePokerTemplateMutation.graphql'
import {RemovePokerTemplateMutation_team} from '../__generated__/RemovePokerTemplateMutation_team.graphql'
import handleRemovePokerTemplate from './handlers/handleRemovePokerTemplate'

graphql`
  fragment RemovePokerTemplateMutation_team on RemovePokerTemplatePayload {
    pokerTemplate {
      id
      teamId
    }
    pokerMeetingSettings {
      selectedTemplateId
      selectedTemplate {
        id
      }
    }
  }
`

const mutation = graphql`
  mutation RemovePokerTemplateMutation($templateId: ID!) {
    removePokerTemplate(templateId: $templateId) {
      ...RemovePokerTemplateMutation_team @relay(mask: false)
    }
  }
`

export const removePokerTemplateTeamUpdater: SharedUpdater<RemovePokerTemplateMutation_team> = (
  payload,
  {store}
) => {
  const templateId = getInProxy(payload, 'pokerTemplate', 'id')
  const teamId = getInProxy(payload, 'pokerTemplate', 'teamId')
  handleRemovePokerTemplate(templateId, teamId, store)
}

type PokerTemplate = NonNullable<RemovePokerTemplateMutation_team['pokerTemplate']>

const RemovePokerTemplateMutation: StandardMutation<TRemovePokerTemplateMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TRemovePokerTemplateMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    updater: (store) => {
      const payload = store.getRootField('removePokerTemplate')
      if (!payload) return
      removePokerTemplateTeamUpdater(payload, {atmosphere, store})
    },
    optimisticUpdater: (store) => {
      const {templateId} = variables
      const template = store.get<PokerTemplate>(templateId)!
      const teamId = template.getValue('teamId')
      handleRemovePokerTemplate(templateId, teamId, store)
    }
  })
}

export default RemovePokerTemplateMutation
