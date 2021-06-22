import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {PASCAL_MUTATIONMutation as TPASCAL_MUTATIONMutation} from '../__generated__/PASCAL_MUTATIONMutation.graphql'

graphql`
  fragment PASCAL_MUTATIONMutation_LCASE_SUB on PASCAL_MUTATIONSuccess {

  }
`

const mutation = graphql`
  mutation PASCAL_MUTATIONMutation() {
    MUTATION_NAME() {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...PASCAL_MUTATIONMutation_LCASE_SUB @relay(mask: false)
    }
  }
`

const PASCAL_MUTATIONMutation: StandardMutation<TPASCAL_MUTATIONMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TPASCAL_MUTATIONMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const { } = variables

    },
    onCompleted,
    onError
  })
}

export default PASCAL_MUTATIONMutation
