import base64url from 'base64url'
import getSSODomainFromEmail from 'parabol-client/utils/getSSODomainFromEmail'
import getRethink from '../database/rethinkDriver'
import {URL} from 'url'

const urlWithRelayState = (url: string, isInvited?: boolean | null) => {
  if (!isInvited) return url
  const relayState = base64url.encode(JSON.stringify({isInvited: true}))
  const urlObj = new URL(url)
  urlObj.searchParams.append('RelayState', relayState)
  return urlObj.toString()
}

const getSAMLURLFromEmail = async (email: string, isInvited?: boolean | null) => {
  const domainName = getSSODomainFromEmail(email)
  if (!domainName) return null
  const r = await getRethink()
  const baseURL = (await r
    .table('SAML')
    .getAll(domainName, {index: 'domains'})
    .nth(0)('url')
    .default(null)
    .run()) as string | null
  if (!baseURL) return null
  return urlWithRelayState(baseURL, isInvited)
}

export default getSAMLURLFromEmail
