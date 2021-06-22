import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {SprintPokerDefaults} from '~/types/constEnums'
import {SharedUpdater, StandardMutation} from '../types/relayMutations'
import createProxyRecord from '../utils/relay/createProxyRecord'
import {setActiveTemplateInRelayStore} from '../utils/relay/setActiveTemplate'
import {AddPokerTemplateMutation as TAddPokerTemplateMutation} from '../__generated__/AddPokerTemplateMutation.graphql'
import {AddPokerTemplateMutation_team} from '../__generated__/AddPokerTemplateMutation_team.graphql'
import handleAddPokerTemplate from './handlers/handleAddPokerTemplate'

graphql`
  fragment AddPokerTemplateMutation_team on AddPokerTemplatePayload {
    pokerTemplate {
      ...TemplateSharing_template
      ...PokerTemplateDetailsTemplate
      id
      teamId
    }
  }
`

const mutation = graphql`
  mutation AddPokerTemplateMutation($teamId: ID!, $parentTemplateId: ID) {
    addPokerTemplate(teamId: $teamId, parentTemplateId: $parentTemplateId) {
      ...AddPokerTemplateMutation_team @relay(mask: false)
    }
  }
`

export const addPokerTemplateTeamUpdater: SharedUpdater<AddPokerTemplateMutation_team> = (
  payload,
  {store}
) => {
  const template = payload.getLinkedRecord('pokerTemplate')
  if (!template) return
  const templateId = template.getValue('id')
  handleAddPokerTemplate(template, store)
  const teamId = template.getValue('teamId')
  const team = store.get(teamId)
  if (!team) return
  setActiveTemplateInRelayStore(store, teamId, templateId, 'poker')
}

const AddPokerTemplateMutation: StandardMutation<TAddPokerTemplateMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TAddPokerTemplateMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    updater: (store) => {
      const payload = store.getRootField('addPokerTemplate')
      if (!payload) return
      addPokerTemplateTeamUpdater(payload, {atmosphere, store})
    },
    optimisticUpdater: (store) => {
      const {parentTemplateId, teamId} = variables
      const nowISO = new Date().toJSON()
      const team = store.get(teamId)!
      const parentTemplate = parentTemplateId ? store.get(parentTemplateId) : null
      const name = parentTemplate ? parentTemplate.getValue('name') + ' Copy' : '*New Template'

      const proxyTemplate = createProxyRecord(store, 'PokerTemplate', {
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
        const dimension = createProxyRecord(store, 'TemplateDimension', {
          scaleId: SprintPokerDefaults.DEFAULT_SCALE_ID,
          description: '',
          sortOrder: 0,
          name: '*New Dimension',
          teamId,
          templateId
        })
        proxyTemplate.setLinkedRecords([dimension], 'dimensions')
      }
      handleAddPokerTemplate(proxyTemplate, store)
    }
  })
}

export default AddPokerTemplateMutation
