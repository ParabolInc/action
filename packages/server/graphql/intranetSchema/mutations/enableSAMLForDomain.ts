import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLString} from 'graphql'
import * as samlify from 'samlify'
import {v4 as uuid} from 'uuid'
import zlib from 'zlib'
import getRethink from '../../../database/rethinkDriver'
import EnableSAMLForDomainPayload from '../types/EnableSAMLForDomainPayload'

const AZURE_AD_LOGIN_URL_HOSTNAME = `microsoftonline`

const isMicrosoft = (url: string): boolean =>
  new URL(url).hostname.includes(AZURE_AD_LOGIN_URL_HOSTNAME)

const getURLWithSAMLRequestParam = (destination: string, slug: string) => {
  const template = `
  <samlp:AuthnRequest
      xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
      xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ID="_${uuid()}" Version="2.0" IssueInstant="${new Date().toISOString()}" Destination="${destination}" ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" AssertionConsumerServiceURL="https://${
    process.env.HOST
  }/saml/${slug}">
  <saml:Issuer>https://${process.env.HOST}/saml-metadata/${slug}</saml:Issuer>
      <samlp:NameIDPolicy Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress" AllowCreate="false"/>
  </samlp:AuthnRequest>
  `
  const SAMLRequest = encodeURIComponent(zlib.deflateRawSync(template).toString('base64'))
  const url = new URL(destination)
  url.searchParams.append('SAMLRequest', SAMLRequest)
  return url.toString()
}

const enableSAMLForDomain = {
  type: new GraphQLNonNull(EnableSAMLForDomainPayload),
  description: 'Enable SAML for domain',
  args: {
    name: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'A name to use for the redirect URL. Usually the company name without any spaces'
    },
    domains: {
      type: GraphQLNonNull(GraphQLList(GraphQLNonNull(GraphQLID))),
      description:
        'a list of domains that the account has control over. usually the part after the @ of their email'
    },
    metadata: {
      type: GraphQLNonNull(GraphQLString),
      description: 'A big chunk of XML data containing th redirect URL and X.509 certificate'
    }
  },
  async resolve(_source, {name, domains, metadata}) {
    const r = await getRethink()
    const normalizedDomains = domains.map((domain) => domain.toLowerCase())
    const normalizedName = name.trim().toLowerCase()

    // VALIDATION
    const nameRegex = /^[a-z0-9_-]+$/
    if (!nameRegex.test(normalizedName)) {
      return {error: {message: 'Name must be letters and numbers or _ or - with no spaces'}}
    }
    const idp = samlify.IdentityProvider({metadata})
    const {singleSignOnService} = idp.entityMeta.meta
    const [fallbackKey] = Object.keys(singleSignOnService)
    if (!fallbackKey) {
      return {error: {message: 'Invalid metadata. Does not contain sign on URL'}}
    }
    const postKey = 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST'
    const signOnURL = singleSignOnService[postKey] || singleSignOnService[fallbackKey]
    try {
      new URL(signOnURL)
    } catch (e) {
      return {error: {message: `Invalid Sign on URL: ${signOnURL}`}}
    }

    const conflictingRecord = await r
      .table('SAML')
      .getAll(r.args(normalizedDomains), {index: 'domains'})
      .filter({id: name})
      .nth(0)
      .default(null)
      .run()

    if (conflictingRecord) {
      const {id: conflictId, domains: conflictDomains} = conflictingRecord
      const domainStr = conflictDomains.join(', ')
      return {error: {message: `${conflictId} already controls ${domainStr}`}}
    }

    // RESOLUTION
    const url = isMicrosoft(signOnURL)
      ? getURLWithSAMLRequestParam(signOnURL, normalizedName)
      : signOnURL
    await r
      .table('SAML')
      .insert(
        {
          id: normalizedName,
          domains: normalizedDomains,
          url,
          metadata: metadata
        },
        {conflict: 'replace'}
      )
      .run()

    return {success: true}
  }
}

export default enableSAMLForDomain
