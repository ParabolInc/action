import {GraphQLNonNull} from 'graphql'
import UpdateOrgInput from '../types/UpdateOrgInput'
import UpdateOrgPayload from '../types/UpdateOrgPayload'
import {default as updateOrgResolver} from './helpers/updateOrg'

export default {
  type: new GraphQLNonNull(UpdateOrgPayload),
  description: 'Update an with a change in name, avatar',
  args: {
    updatedOrg: {
      type: new GraphQLNonNull(UpdateOrgInput),
      description: 'the updated org including the id, and at least one other field'
    }
  },
  resolve: updateOrgResolver
}
