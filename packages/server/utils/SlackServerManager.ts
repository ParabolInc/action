import fetch from 'node-fetch'
import SlackManager from 'parabol-client/utils/SlackManager'
import {stringify} from 'querystring'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import appOrigin from '../appOrigin'

interface IncomingWebhook {
  url: string
  channel: string
  channel_id: string
  configuration_url: string
}

interface OAuth2Response {
  ok: boolean
  app_id: string
  access_token: string
  authed_user: {
    id: string
  }
  error?: any
  scope: string
  bot_user_id: string
  team: {
    id: string
    name: string
  }
  incoming_webhook: IncomingWebhook
}

class SlackServerManager extends SlackManager {
  fetch = fetch
  static async init(code: string) {
    return SlackServerManager.fetchToken(code)
  }

  static async fetchToken(code: string) {
    const queryParams = {
      client_id: process.env.SLACK_CLIENT_ID,
      client_secret: process.env.SLACK_CLIENT_SECRET,
      code,
      redirect_uri: makeAppURL(appOrigin, 'auth/slack')
    }

    const uri = `https://slack.com/api/oauth.v2.access?${stringify(queryParams)}`

    const tokenRes = await fetch(uri, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })
    const tokenJson = (await tokenRes.json()) as OAuth2Response
    const {error} = tokenJson

    if (error) {
      throw new Error(`Slack: ${error}`)
    }
    return new SlackServerManager(tokenJson.access_token, tokenJson) as Required<SlackServerManager>
  }

  constructor(botAccessToken, public response?: OAuth2Response) {
    super(botAccessToken)
  }
}

export default SlackServerManager
