import {ReflectTemplatePromptUpdateDescriptionMutation as TReflectTemplatePromptUpdateDescriptionMutation} from '../__generated__/ReflectTemplatePromptUpdateDescriptionMutation.graphql'
import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {StandardMutation} from '../types/relayMutations'

graphql`
  fragment ReflectTemplatePromptUpdateDescriptionMutation_team on ReflectTemplatePromptUpdateDescriptionPayload {
    prompt {
      description
    }
  }
`

const mutation = graphql`
  mutation ReflectTemplatePromptUpdateDescriptionMutation($promptId: ID!, $description: String!) {
    reflectTemplatePromptUpdateDescription(promptId: $promptId, description: $description) {
      error {
        message
      }
      ...ReflectTemplatePromptUpdateDescriptionMutation_team @relay(mask: false)
    }
  }
`

const ReflectTemplatePromptUpdateDescriptionMutation: StandardMutation<TReflectTemplatePromptUpdateDescriptionMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TReflectTemplatePromptUpdateDescriptionMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    optimisticUpdater: (store) => {
      const {description, promptId} = variables
      const prompt = store.get(promptId)
      if (!prompt) return
      prompt.setValue(description, 'description')
    }
  })
}

export default ReflectTemplatePromptUpdateDescriptionMutation
