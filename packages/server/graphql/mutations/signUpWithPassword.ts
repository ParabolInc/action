import bcrypt from 'bcrypt'
import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {AuthenticationError, Security} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import createEmailVerification from '../../email/createEmailVerification'
import createNewLocalUser from '../../utils/createNewLocalUser'
import encodeAuthToken from '../../utils/encodeAuthToken'
import isEmailVerificationRequired from '../../utils/isEmailVerificationRequired'
import {GQLContext} from '../graphql'
import rateLimit from '../rateLimit'
import SignUpWithPasswordPayload from '../types/SignUpWithPasswordPayload'
import attemptLogin from './helpers/attemptLogin'
import bootstrapNewUser from './helpers/bootstrapNewUser'

type SignUpWithPasswordMutationVariables = {
  email: string
  password: string
  invitationToken?: string | null
  segmentId?: string | null
}

const signUpWithPassword = {
  type: new GraphQLNonNull(SignUpWithPasswordPayload),
  description: 'Sign up using an email address and password',
  args: {
    email: {
      type: new GraphQLNonNull(GraphQLID)
    },
    password: {
      type: new GraphQLNonNull(GraphQLString)
    },
    segmentId: {
      type: GraphQLID,
      description: 'optional segment id created before they were a user'
    },
    invitationToken: {
      type: GraphQLID,
      description: 'used to determine what suggested actions to create'
    }
  },
  resolve: rateLimit({perMinute: 50, perHour: 500})(
    async (_source, args: SignUpWithPasswordMutationVariables, context: GQLContext) => {
      const {invitationToken, password, segmentId} = args
      const denormEmail = args.email
      const email = denormEmail.toLowerCase()
      const r = await getRethink()
      const isOrganic = !invitationToken
      const {ip} = context
      const loginAttempt = await attemptLogin(email, password, ip)
      if (loginAttempt.userId) {
        context.authToken = loginAttempt.authToken
        return {
          userId: loginAttempt.userId,
          authToken: encodeAuthToken(loginAttempt.authToken)
        }
      }
      const {error} = loginAttempt
      if (error === AuthenticationError.USER_EXISTS_GOOGLE) {
        return {error: {message: 'Try logging in with Google'}}
      } else if (error === AuthenticationError.INVALID_PASSWORD) {
        return {error: {message: 'User already exists'}}
      }

      // it's a new user!
      const [nickname, domain] = email.split('@')
      if (!nickname || !domain) {
        return {error: {message: 'Invalid email'}}
      }
      const verificationRequired = await isEmailVerificationRequired(domain)
      if (verificationRequired) {
        const existingVerification = await r
          .table('EmailVerification')
          .getAll(email, {index: 'email'})
          .filter((row) => row('expiration').gt(new Date()))
          .nth(0)
          .default(null)
          .run()
        if (existingVerification) {
          return {error: {message: 'Verification email already sent'}}
        }
        return createEmailVerification(args)
      }
      const hashedPassword = await bcrypt.hash(password, Security.SALT_ROUNDS)
      const newUser = createNewLocalUser({email, hashedPassword, isEmailVerified: false, segmentId})
      // MUTATIVE
      context.authToken = await bootstrapNewUser(newUser, isOrganic)
      return {
        userId: newUser.id,
        authToken: encodeAuthToken(context.authToken)
      }
    }
  )
}

export default signUpWithPassword
