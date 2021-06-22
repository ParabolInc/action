import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {SharedUpdater, StandardMutation} from '../types/relayMutations'
import createProxyRecord from '../utils/relay/createProxyRecord'
import {setActiveTemplateInRelayStore} from '../utils/relay/setActiveTemplate'
import {AddReflectTemplateMutation as TAddReflectTemplateMutation} from '../__generated__/AddReflectTemplateMutation.graphql'
import {AddReflectTemplateMutation_team} from '../__generated__/AddReflectTemplateMutation_team.graphql'
import handleAddReflectTemplate from './handlers/handleAddReflectTemplate'

graphql`
  fragment AddReflectTemplateMutation_team on AddReflectTemplatePayload {
    reflectTemplate {
      ...TemplateSharing_template
      ...ReflectTemplateDetailsTemplate
      id
      teamId
    }
  }
`

const mutation = graphql`
  mutation AddReflectTemplateMutation($teamId: ID!, $parentTemplateId: ID) {
    addReflectTemplate(teamId: $teamId, parentTemplateId: $parentTemplateId) {
      ...AddReflectTemplateMutation_team @relay(mask: false)
    }
  }
`

export const addReflectTemplateTeamUpdater: SharedUpdater<AddReflectTemplateMutation_team> = (
  payload,
  {store}
) => {
  const template = payload.getLinkedRecord('reflectTemplate')
  if (!template) return
  const templateId = template.getValue('id')
  handleAddReflectTemplate(template, store)
  const teamId = template.getValue('teamId')
  const team = store.get(teamId)
  if (!team) return
  setActiveTemplateInRelayStore(store, teamId, templateId, 'retrospective')
}

const AddReflectTemplateMutation: StandardMutation<TAddReflectTemplateMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TAddReflectTemplateMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    updater: (store) => {
      const payload = store.getRootField('addReflectTemplate')
      if (!payload) return
      addReflectTemplateTeamUpdater(payload, {atmosphere, store})
    },
    optimisticUpdater: (store) => {
      const {parentTemplateId, teamId} = variables
      const nowISO = new Date().toJSON()
      const team = store.get(teamId)!
      const parentTemplate = parentTemplateId ? store.get(parentTemplateId) : null
      const name = parentTemplate ? parentTemplate.getValue('name') + ' Copy' : '*New Template'

      const proxyTemplate = createProxyRecord(store, 'ReflectTemplate', {
        name,
        createdAt: nowISO,
        teamId
      })
      proxyTemplate.setLinkedRecord(team, 'team')
      const templateId = proxyTemplate.getValue('id')

      if (parentTemplate) {
        const currentPrompts = parentTemplate.getLinkedRecords('prompts')!
        proxyTemplate.setLinkedRecords(currentPrompts, 'prompts')
      } else {
        const prompt = createProxyRecord(store, 'ReflectTemplatePrompt', {
          description: '',
          question: 'New prompt',
          createdAt: nowISO,
          teamId,
          sortOrder: 0,
          templateId
        })
        proxyTemplate.setLinkedRecords([prompt], 'prompts')
      }
      handleAddReflectTemplate(proxyTemplate, store)
    }
  })
}

export default AddReflectTemplateMutation
