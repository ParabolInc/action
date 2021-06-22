import base64url from 'base64url'
import crypto from 'crypto'
import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql'
import ms from 'ms'
import {Threshold} from 'parabol-client/types/constEnums'
import {AuthIdentityTypeEnum} from '../../../client/types/constEnums'
import util from 'util'
import getRethink from '../../database/rethinkDriver'
import AuthIdentityLocal from '../../database/types/AuthIdentityLocal'
import PasswordResetRequest from '../../database/types/PasswordResetRequest'
import User from '../../database/types/User'
import db from '../../db'
import getMailManager from '../../email/getMailManager'
import resetPasswordEmailCreator from '../../email/resetPasswordEmailCreator'
import {GQLContext} from '../graphql'
import rateLimit from '../rateLimit'
import updateUser from '../../postgres/queries/updateUser'

const randomBytes = util.promisify(crypto.randomBytes)

const emailPasswordReset = {
  type: new GraphQLNonNull(GraphQLBoolean),
  description: 'Send an email to reset a password',
  args: {
    email: {
      type: GraphQLNonNull(GraphQLID),
      description: 'email to send the password reset code to'
    }
  },
  resolve: rateLimit({perMinute: 5, perHour: 50})(
    async (_source, {email: denormEmail}, {ip}: GQLContext) => {
      const email = denormEmail.toLowerCase()
      const r = await getRethink()

      // we only wanna send like 2 emails/min or 5 per day to the same person
      const yesterday = new Date(Date.now() - ms('1d'))
      const {user, failOnAccount, failOnTime} = await r({
        user: (r
          .table('User')
          .getAll(email, {index: 'email'})
          .nth(0)
          .default(null) as unknown) as User | null,
        failOnAccount: (r
          .table('PasswordResetRequest')
          .getAll(ip, {index: 'ip'})
          .filter({email})
          .count()
          .ge(Threshold.MAX_ACCOUNT_DAILY_PASSWORD_RESETS) as unknown) as boolean,
        failOnTime: (r
          .table('PasswordResetRequest')
          .getAll(ip, {index: 'ip'})
          .filter((row) => row('time').ge(yesterday))
          .count()
          .ge(Threshold.MAX_DAILY_PASSWORD_RESETS) as unknown) as boolean
      }).run()
      if (failOnAccount || failOnTime || !user) return true
      const {id: userId, identities} = user
      const localIdentity = identities.find(
        (identity) => identity.type === AuthIdentityTypeEnum.LOCAL
      ) as AuthIdentityLocal
      if (!localIdentity) return true
      // seems legit, make a record of it create a reset code
      const tokenBuffer = await randomBytes(48)
      const resetPasswordToken = base64url.encode(tokenBuffer)
      // invalidate all other tokens for this email
      await r
        .table('PasswordResetRequest')
        .getAll(email, {index: 'email'})
        .filter({isValid: true})
        .update({isValid: false})
        .run()
      await r
        .table('PasswordResetRequest')
        .insert(new PasswordResetRequest({ip, email, token: resetPasswordToken}))
        .run()

      const updates = {identities}
      await Promise.all([updateUser(updates, userId), db.write('User', userId, updates)])

      const {subject, body, html} = resetPasswordEmailCreator({resetPasswordToken})
      const success = await getMailManager().sendEmail({
        to: email,
        subject,
        body,
        html,
        tags: ['type:resetPassword']
      })
      return success
    }
  )
}

export default emailPasswordReset
