interface ErrorResponse {
  ok: false
  error: string
}

export interface SlackConversation {
  id: string
  name: string
  is_channel: boolean
  is_group: boolean
  is_im: false
  created: number
  creator: string
  is_archived: boolean
  is_general: boolean
  unlinked: number
  name_normalized: string
  is_read_only: boolean
  is_shared: boolean
  parent_conversation: null
  is_ext_shared: boolean
  is_org_shared: boolean
  pending_shared: []
  is_pending_ext_shared: boolean
  is_member: boolean
  is_private: boolean
  is_mpim: boolean
  last_read: string
  latest: {
    bot_id: string
    type: string
    text: string
    user: string
    ts: string
    team: string
    bot_profile: {
      id: string
      deleted: boolean
      name: string
      updated: number
      app_id: string
      icons: any
      team_id: string
    }
  }
  topic: {
    value: string
    creator: string
    last_set: number
  }
  purpose: {
    value: string
    creator: string
    last_set: number
  }
  previous_names: string[]
  locale: string
}

interface ConversationListResponse {
  ok: true
  channels: SlackConversation[]
}
interface ConversationJoinResponse {
  ok: true
  channel: {
    id: string
  }
}

interface PostMessageResponse {
  ok: true
}

interface UpdateMessageResponse {
  ok: true
  channel: string
  ts: string
  text: string
}

interface SlackUser {
  id: string
  team_id: string
  name: string
  deleted: boolean
  color: string
  real_name: string
  tz: string
  tz_label: string
  tz_offset: number
  profile: {
    avatar_hash: string
    status_text: string
    status_emoj: string
    status_expiration: number
    real_name: string
    display_name: string
    real_name_normalized: string
    display_name_normalized: string
    image_original: string
    image_24: string
    image_32: string
    image_48: string
    image_72: string
    image_192: string
    image_512: string
    team: string
  }
  is_admin: true
  is_owner: boolean
  is_primary_owner: boolean
  is_restricted: boolean
  is_ultra_restricted: boolean
  is_bot: boolean
  is_stranger: boolean
  updated: number
  is_app_user: boolean
  has_2fa: boolean
  locale: string
}

interface UserInfoResponse {
  ok: true
  user: SlackUser
}

interface ConversationInfoResponse {
  ok: true
  channel: SlackConversation
}

type ConversationType = 'public_channel' | 'private_channel'

abstract class SlackManager {
  static SCOPE = 'incoming-webhook,channels:read,channels:join,chat:write,users:read'
  token: string
  abstract fetch: any
  // the any is for node until we can use tsc in nodeland
  cache: {[key: string]: {result: any; expiration: number | any}} = {}
  timeout = 5000
  headers: any

  constructor(token: string) {
    this.token = token
  }

  private async post<T>(url: string, payload: any): Promise<T | ErrorResponse> {
    const res = await this.fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json' as const,
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(payload)
    })
    return res.json()
  }
  async get<T>(url: string): Promise<T | ErrorResponse> {
    const record = this.cache[url]
    if (!record) {
      const res = await this.fetch(encodeURI(url))
      const result = await res.json()
      this.cache[url] = {
        result,
        expiration: setTimeout(() => {
          delete this.cache[url]
        }, this.timeout)
      }
    } else {
      clearTimeout(record.expiration)
      record.expiration = setTimeout(() => {
        delete this.cache[url]
      }, this.timeout)
    }
    return this.cache[url].result
  }

  getConversationInfo(channelId: string) {
    return this.get<ConversationInfoResponse>(
      `https://slack.com/api/conversations.info?token=${this.token}&channel=${channelId}`
    )
  }

  getConversationList(types: ConversationType[] = ['public_channel']) {
    const typeStr = types.join(',')
    return this.get<ConversationListResponse>(
      `https://slack.com/api/conversations.list?token=${this.token}&exclude_archived=true&types=${typeStr}`
    )
  }

  getUserInfo(userId: string) {
    return this.get<UserInfoResponse>(
      `https://slack.com/api/users.info?token=${this.token}&user=${userId}`
    )
  }

  joinConversation(channelId: string) {
    return this.get<ConversationJoinResponse>(
      `https://slack.com/api/conversations.join?token=${this.token}&channel=${channelId}`
    )
  }

  postMessage(channelId: string, text: string | Array<{type: string}>) {
    const prop = typeof text === 'string' ? 'text' : Array.isArray(text) ? 'blocks' : null
    if (!prop) throw new Error('Invalid Slack postMessage')
    const payload = {
      channel: channelId,
      unfurl_links: true,
      [prop]: text
    }
    return this.post<PostMessageResponse>('https://slack.com/api/chat.postMessage', payload)
  }

  updateMessage(channelId: string, text: string, ts: string) {
    return this.get<UpdateMessageResponse>(
      `https://slack.com/api/chat.update?token=${this.token}&channel=${channelId}&text=${text}&ts=${ts}`
    )
  }
}

export default SlackManager
