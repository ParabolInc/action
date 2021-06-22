import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {StandardMutation} from '../types/relayMutations'
import {RenameReflectTemplatePromptMutation as TRenameReflectTemplatePromptMutation} from '~/__generated__/RenameReflectTemplatePromptMutation.graphql'

graphql`
  fragment RenameReflectTemplatePromptMutation_team on RenameReflectTemplatePromptPayload {
    prompt {
      question
    }
  }
`

const mutation = graphql`
  mutation RenameReflectTemplatePromptMutation($promptId: ID!, $question: String!) {
    renameReflectTemplatePrompt(promptId: $promptId, question: $question) {
      error {
        message
      }
      ...RenameReflectTemplatePromptMutation_team @relay(mask: false)
    }
  }
`

const RenameReflectTemplatePromptMutation: StandardMutation<TRenameReflectTemplatePromptMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TRenameReflectTemplatePromptMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    optimisticUpdater: (store) => {
      const {question, promptId} = variables
      const prompt = store.get(promptId)
      if (!prompt) return
      prompt.setValue(question, 'question')
    }
  })
}

export default RenameReflectTemplatePromptMutation
