import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {SharedUpdater, StandardMutation} from '../types/relayMutations'
import getInProxy from '../utils/relay/getInProxy'
import {RemoveReflectTemplateMutation as TRemoveReflectTemplateMutation} from '../__generated__/RemoveReflectTemplateMutation.graphql'
import {RemoveReflectTemplateMutation_team} from '../__generated__/RemoveReflectTemplateMutation_team.graphql'
import handleRemoveReflectTemplate from './handlers/handleRemoveReflectTemplate'

graphql`
  fragment RemoveReflectTemplateMutation_team on RemoveReflectTemplatePayload {
    reflectTemplate {
      id
      teamId
    }
    retroMeetingSettings {
      selectedTemplateId
      selectedTemplate {
        id
      }
    }
  }
`

const mutation = graphql`
  mutation RemoveReflectTemplateMutation($templateId: ID!) {
    removeReflectTemplate(templateId: $templateId) {
      ...RemoveReflectTemplateMutation_team @relay(mask: false)
    }
  }
`

type ReflectTemplate = NonNullable<RemoveReflectTemplateMutation_team['reflectTemplate']>

export const removeReflectTemplateTeamUpdater: SharedUpdater<RemoveReflectTemplateMutation_team> = (
  payload,
  {store}
) => {
  const templateId = getInProxy(payload, 'reflectTemplate', 'id')
  const teamId = getInProxy(payload, 'reflectTemplate', 'teamId')
  handleRemoveReflectTemplate(templateId, teamId, store)
}

const RemoveReflectTemplateMutation: StandardMutation<TRemoveReflectTemplateMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TRemoveReflectTemplateMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    updater: (store) => {
      const payload = store.getRootField('removeReflectTemplate')
      if (!payload) return
      removeReflectTemplateTeamUpdater(payload, {atmosphere, store})
    },
    optimisticUpdater: (store) => {
      const {templateId} = variables
      const template = store.get<ReflectTemplate>(templateId)!
      const teamId = template.getValue('teamId')
      handleRemoveReflectTemplate(templateId, teamId, store)
    }
  })
}

export default RemoveReflectTemplateMutation
