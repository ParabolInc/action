import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {UploadableMap} from 'relay-runtime'

const mutation = graphql`
  mutation UploadOrgImageMutation($file: File!, $orgId: ID!) {
    uploadOrgImage(file: $file, orgId: $orgId) {
      error {
        message
      }
      ...UpdateOrgMutation_organization @relay(mask: false)
    }
  }
`

const UploadOrgImageMutation = (
  atmosphere,
  variables,
  {onCompleted, onError},
  uploadables?: UploadableMap
) => {
  return commitMutation(atmosphere, {
    mutation,
    variables,
    uploadables,
    onCompleted,
    onError
  })
}

export default UploadOrgImageMutation
