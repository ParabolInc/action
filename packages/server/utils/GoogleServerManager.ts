import GoogleManager from 'parabol-client/utils/GoogleManager'
import {stringify} from 'querystring'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import appOrigin from '../appOrigin'
import fetch from 'node-fetch'
import {decode} from 'jsonwebtoken'

interface OAuth2Response {
  access_token: string
  id_token: string
  expires_in: number
  token_type: string
  refresh_token?: string
}

export interface GoogleIDToken {
  iss: string
  at_hash: string
  email_verified: string
  sub: string
  azp: string
  email: string
  aud: string
  iat: number
  exp: number
  nonce: string
  hd: string
  profile?: string
  picture?: string
  name?: string
}

export default class GoogleServerManager extends GoogleManager {
  fetch = fetch
  static async init(code: string) {
    return GoogleServerManager.fetchToken(code)
  }

  static async fetchToken(code: string) {
    const queryParams = {
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: makeAppURL(appOrigin, 'auth/google')
    }

    const uri = `https://oauth2.googleapis.com/token?${stringify(queryParams)}`

    const tokenRes = await fetch(uri, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })
    const tokenJson = (await tokenRes.json()) as OAuth2Response
    const {access_token: accessToken, id_token: idToken} = tokenJson
    const id = decode(idToken) as GoogleIDToken
    return new GoogleServerManager(accessToken, id)
  }

  id?: GoogleIDToken
  constructor(accessToken: string, id?: GoogleIDToken) {
    super(accessToken)
    this.id = id
  }
}
