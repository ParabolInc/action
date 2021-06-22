import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {StandardMutation} from '../types/relayMutations'
import {RenameMeetingTemplateMutation as TRenameMeetingTemplateMutation} from '~/__generated__/RenameMeetingTemplateMutation.graphql'

graphql`
  fragment RenameMeetingTemplateMutation_meetingTemplate on RenameMeetingTemplatePayload {
    meetingTemplate {
      name
    }
  }
`

const mutation = graphql`
  mutation RenameMeetingTemplateMutation($templateId: ID!, $name: String!) {
    renameMeetingTemplate(templateId: $templateId, name: $name) {
      ...RenameMeetingTemplateMutation_meetingTemplate @relay(mask: false)
    }
  }
`

const RenameMeetingTemplateMutation: StandardMutation<TRenameMeetingTemplateMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TRenameMeetingTemplateMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    optimisticUpdater: (store) => {
      const {name, templateId} = variables
      const template = store.get(templateId)
      if (!template) return
      template.setValue(name, 'name')
    }
  })
}

export default RenameMeetingTemplateMutation
