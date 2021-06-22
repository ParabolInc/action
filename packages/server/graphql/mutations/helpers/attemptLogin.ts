import bcrypt from 'bcrypt'
import ms from 'ms'
import {AuthenticationError, Threshold} from 'parabol-client/types/constEnums'
import {AuthIdentityTypeEnum} from '../../../../client/types/constEnums'
import sleep from 'parabol-client/utils/sleep'
import getRethink from '../../../database/rethinkDriver'
import AuthIdentityLocal from '../../../database/types/AuthIdentityLocal'
import AuthToken from '../../../database/types/AuthToken'
import FailedAuthRequest from '../../../database/types/FailedAuthRequest'
import User from '../../../database/types/User'

const logFailedLogin = async (ip: string, email: string) => {
  const r = await getRethink()
  if (ip) {
    const failedAuthRequest = new FailedAuthRequest({ip, email})
    await r
      .table('FailedAuthRequest')
      .insert(failedAuthRequest)
      .run()
  }
}

const attemptLogin = async (denormEmail: string, password: string, ip = '') => {
  const r = await getRethink()
  const yesterday = new Date(Date.now() - ms('1d'))
  const email = denormEmail.toLowerCase()
  const {existingUser, failOnAccount, failOnTime} = await r({
    existingUser: (r
      .table('User')
      .getAll(email, {index: 'email'})
      .nth(0)
      .default(null) as unknown) as User,
    failOnAccount: (r
      .table('FailedAuthRequest')
      .getAll(ip, {index: 'ip'})
      .filter({email})
      .count()
      .ge(Threshold.MAX_ACCOUNT_PASSWORD_ATTEMPTS) as unknown) as boolean,
    failOnTime: (r
      .table('FailedAuthRequest')
      .getAll(ip, {index: 'ip'})
      .filter((row) => row('time').ge(yesterday))
      .count()
      .ge(Threshold.MAX_DAILY_PASSWORD_ATTEMPTS) as unknown) as boolean
  }).run()
  if (failOnAccount || failOnTime) {
    await sleep(1000)
    // silently fail to trick security researchers
    return {error: AuthenticationError.INVALID_PASSWORD}
  }

  if (!existingUser) {
    await logFailedLogin(ip, email)
    return {error: AuthenticationError.USER_NOT_FOUND}
  }

  const {id: viewerId, identities, rol} = existingUser
  const localIdentity = identities.find(
    (identity) => identity.type === AuthIdentityTypeEnum.LOCAL
  ) as AuthIdentityLocal
  if (!localIdentity) {
    const [bestIdentity] = identities
    if (!bestIdentity) {
      return {error: AuthenticationError.IDENTITY_NOT_FOUND}
    }
    const {type} = bestIdentity
    if (type === AuthIdentityTypeEnum.GOOGLE) return {error: AuthenticationError.USER_EXISTS_GOOGLE}
    throw new Error(`Unknown identity type: ${type}`)
  }
  const {hashedPassword} = localIdentity
  if (!hashedPassword) {
    return {error: AuthenticationError.MISSING_HASH}
  }
  // check password
  const isCorrectPassword = await bcrypt.compare(password, hashedPassword)
  if (isCorrectPassword) {
    return {
      userId: viewerId,
      // create a brand new auth token using the tms in our DB
      authToken: new AuthToken({sub: viewerId, rol, tms: existingUser.tms})
    }
  }
  await logFailedLogin(ip, email)
  return {error: AuthenticationError.INVALID_PASSWORD}
}

export default attemptLogin
