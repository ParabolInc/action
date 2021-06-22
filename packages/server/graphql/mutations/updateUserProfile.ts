import {GraphQLNonNull} from 'graphql'
import UpdateUserProfileInput from '../types/UpdateUserProfileInput'
import UpdateUserProfilePayload from '../types/UpdateUserProfilePayload'
import {default as updateUserProfileResolver} from './helpers/updateUserProfile'

const updateUserProfile = {
  type: UpdateUserProfilePayload,
  args: {
    updatedUser: {
      type: new GraphQLNonNull(UpdateUserProfileInput),
      description: 'The input object containing the user profile fields that can be changed'
    }
  },
  resolve: updateUserProfileResolver
}

export default updateUserProfile
