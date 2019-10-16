import getSSODomainFromEmail from 'parabol-client/utils/getSSODomainFromEmail'
import getRethink from '../database/rethinkDriver'
import base64url from 'base64url'
import {stringify} from 'querystring'
import {SSOParams, SSORelayState} from '../graphql/queries/SAMLIdP'

const getSAMLURLFromEmail = async (email: string, isInvited?: boolean | null) => {
  const domainName = getSSODomainFromEmail(email)
  if (!domainName) return null
  const r = getRethink()
  const baseURL = (await r
    .table('SAML')
    .getAll(domainName, {index: 'domain'})
    .nth(0)('url')
    .default(null)) as string | null
  if (!baseURL) return null
  const params = {} as SSOParams
  const ssoRelayState = {isInvited} as SSORelayState
  const relayState = isInvited ? base64url.encode(JSON.stringify(ssoRelayState)) : ''
  if (relayState) {
    params.RelayState = relayState
  }
  const suffixStr = stringify(params as any)
  const suffix = suffixStr ? `?${suffixStr}` : ''
  return `${baseURL}${suffix}`
}

export default getSAMLURLFromEmail
