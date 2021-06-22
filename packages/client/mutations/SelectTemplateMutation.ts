import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {SimpleMutation} from '../types/relayMutations'
import {
  SelectTemplateMutation as TSelectTemplateMutation,
  SelectTemplateMutationResponse
} from '../__generated__/SelectTemplateMutation.graphql'

graphql`
  fragment SelectTemplateMutation_team on SelectTemplatePayload {
    meetingSettings {
      ... on RetrospectiveMeetingSettings {
        selectedTemplateId
        selectedTemplate {
          id
        }
      }
      ... on PokerMeetingSettings {
        selectedTemplateId
        selectedTemplate {
          id
        }
      }
    }
  }
`

const mutation = graphql`
  mutation SelectTemplateMutation($selectedTemplateId: ID!, $teamId: ID!) {
    selectTemplate(selectedTemplateId: $selectedTemplateId, teamId: $teamId) {
      ...SelectTemplateMutation_team @relay(mask: false)
    }
  }
`

type SelectTemplate = NonNullable<SelectTemplateMutationResponse['selectTemplate']>

const SelectTemplateMutation: SimpleMutation<TSelectTemplateMutation> = (atmosphere, variables) => {
  return commitMutation(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {selectedTemplateId, teamId} = variables
      const team = store.get(teamId)
      if (!team) return
      const selectedTemplate = store.get<SelectTemplate>(selectedTemplateId)!
      const meetingSettings = team.getLinkedRecord('meetingSettings', {
        meetingType: selectedTemplate.getValue('type')
      })
      if (!meetingSettings) return
      meetingSettings.setValue(selectedTemplateId, 'selectedTemplateId')
      meetingSettings.setLinkedRecord(selectedTemplate, 'selectedTemplate')
    }
  })
}

export default SelectTemplateMutation
