import * as validator from '@authenio/samlify-node-xmllint'
import base64url from 'base64url'
import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import getSSODomainFromEmail from 'parabol-client/utils/getSSODomainFromEmail'
import querystring from 'querystring'
import * as samlify from 'samlify'
import getRethink from '../../../database/rethinkDriver'
import AuthToken from '../../../database/types/AuthToken'
import User from '../../../database/types/User'
import generateUID from '../../../generateUID'
import encodeAuthToken from '../../../utils/encodeAuthToken'
import bootstrapNewUser from '../../mutations/helpers/bootstrapNewUser'
import {SSORelayState} from '../../queries/SAMLIdP'
import LoginSAMLPayload from '../types/LoginSAMLPayload'

const serviceProvider = samlify.ServiceProvider({})
samlify.setSchemaValidator(validator)

const getRelayState = (body: any) => {
  const {RelayState} = body
  let relayState = {} as SSORelayState
  try {
    relayState = JSON.parse(base64url.decode(RelayState))
  } catch (e) {
    // ignore
  }
  return relayState
}

const loginSAML = {
  type: new GraphQLNonNull(LoginSAMLPayload),
  description: 'Log in using SAML single sign on (SSO)',
  args: {
    queryString: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The querystring provided by the IdP including SAMLResponse and RelayState'
    },
    samlName: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The name of the SAML identifier. The slug used in the redirect URL'
    }
  },
  async resolve(_source, {samlName, queryString}) {
    const r = await getRethink()
    const now = new Date()
    const body = querystring.parse(queryString)
    const normalizedName = samlName.trim().toLowerCase()
    const doc = await r
      .table('SAML')
      .get(normalizedName)
      .run()

    if (!doc) return {error: {message: `${normalizedName} has not been created in Parabol yet`}}
    const {domains, metadata} = doc
    const idp = samlify.IdentityProvider({metadata})
    let loginResponse
    try {
      loginResponse = await serviceProvider.parseLoginResponse(idp, 'post', {body})
    } catch (e) {
      return {error: {message: e.message}}
    }
    if (!loginResponse) {
      return {error: {message: 'Error with query from identity provider'}}
    }
    const relayState = getRelayState(body)
    const {isInvited} = relayState
    const {extract} = loginResponse
    const {attributes, nameID: name} = extract
    const email = attributes.email?.toLowerCase()
    if (!email) {
      return {error: {message: 'Email attribute was not included in SAML response'}}
    }
    const ssoDomain = getSSODomainFromEmail(email)
    if (!ssoDomain || !domains.includes(ssoDomain)) {
      // don't blindly trust the IdP
      return {error: {message: `${email} does not belong to ${domains.join(', ')}`}}
    }

    const user = await r
      .table('User')
      .getAll(email, {index: 'email'})
      .nth(0)
      .default(null)
      .run()
    if (user) {
      return {
        authToken: encodeAuthToken(new AuthToken({sub: user.id, tms: user.tms, rol: user.rol}))
      }
    }

    const userId = `sso|${generateUID()}`
    const newUser = new User({
      id: userId,
      email,
      preferredName: name,
      lastSeenAt: now,
      tier: 'enterprise'
    })

    const authToken = await bootstrapNewUser(newUser, !isInvited)
    return {
      authToken: encodeAuthToken(authToken)
    }
  }
}

export default loginSAML
