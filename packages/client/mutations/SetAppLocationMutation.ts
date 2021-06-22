import Atmosphere from '../Atmosphere'
import graphql from 'babel-plugin-relay/macro'
import {getRequest} from 'relay-runtime'

graphql`
  fragment SetAppLocationMutation_meeting on SetAppLocationSuccess {
    user {
      id
      lastSeenAtURLs
    }
  }
`

const mutation = graphql`
  mutation SetAppLocationMutation($location: String) {
    setAppLocation(location: $location) {
      ... on ErrorPayload {
        error {
          message
        }
      }
    }
  }
`

const SetAppLocationMutation = (atmosphere: Atmosphere, variables: {location: string | null}) => {
  const request = getRequest(mutation).params
  atmosphere.handleFetchPromise(request, variables)
}

export default SetAppLocationMutation
