import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import AuthIdentity, {authStrategyFields} from './AuthIdentity'

// google: {
//   id: profile.id,
//     email: profile.email,
//     isVerified: profile.verified_email, // we'll assume this is always true
//     name: profile.name,
//     firstName: profile.given_name,
//     lastName: profile.family_name,
//     // link: profile.link, //who cares, it's google+
//     picture: profile.picture,
//     gender: profile.gender,
//     locale: profile.locale
// }

const AuthIdentityGoogle = new GraphQLObjectType<any, GQLContext>({
  name: 'AuthIdentityGoogle',
  interfaces: () => [AuthIdentity],
  description: 'An authentication strategy using Google',
  fields: () => ({
    ...authStrategyFields(),
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The googleID for this strategy'
    }
  })
})

export default AuthIdentityGoogle
