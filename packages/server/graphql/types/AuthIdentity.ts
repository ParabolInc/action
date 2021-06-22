import {GraphQLBoolean, GraphQLInterfaceType, GraphQLNonNull} from 'graphql'
import AuthIdentityTypeEnum from './AuthIdentityTypeEnum'
import AuthIdentityGoogle from './AuthIdentityGoogle'
import {AuthIdentityTypeEnum as EAuthIdentityTypeEnum} from '../../../client/types/constEnums'
import AuthIdentityLocal from './AuthIdentityLocal'

export const authStrategyFields = () => ({
  isEmailVerified: {
    type: new GraphQLNonNull(GraphQLBoolean),
    description: 'true if the email address using this strategy is verified, else false'
  },
  type: {
    type: new GraphQLNonNull(AuthIdentityTypeEnum)
  }
})

const AuthIdentity = new GraphQLInterfaceType({
  name: 'AuthIdentity',
  description: 'An authentication strategy to log in to Parabol',
  fields: authStrategyFields,
  resolveType: ({type}) => {
    const resolveTypeLookup = {
      [EAuthIdentityTypeEnum.LOCAL]: AuthIdentityLocal,
      [EAuthIdentityTypeEnum.GOOGLE]: AuthIdentityGoogle
    }
    return resolveTypeLookup[type]
  }
})

export default AuthIdentity
