import GQLTrebuchetClient, {
  GQLHTTPClient,
  OperationPayload
} from '@mattkrick/graphql-trebuchet-client'
import getTrebuchet, {SocketTrebuchet, SSETrebuchet} from '@mattkrick/trebuchet-client'
import EventEmitter from 'eventemitter3'
import jwtDecode from 'jwt-decode'
import {Disposable} from 'react-relay'
import {RouterProps} from 'react-router'
import {
  CacheConfig,
  Environment,
  FetchFunction,
  GraphQLResponse,
  Network,
  Observable,
  RecordSource,
  RequestParameters,
  Store,
  SubscribeFunction,
  UploadableMap,
  Variables
} from 'relay-runtime'
import {Sink} from 'relay-runtime/lib/network/RelayObservable'
import {RelayFeatureFlags} from 'relay-runtime'
import StrictEventEmitter from 'strict-event-emitter-types'
import {Snack, SnackbarRemoveFn} from './components/Snackbar'
import handleInvalidatedSession from './hooks/handleInvalidatedSession'
import {LocalStorageKey, TrebuchetCloseReason} from './types/constEnums'
import handlerProvider from './utils/relay/handlerProvider'
import {InviteToTeamMutation_notification} from './__generated__/InviteToTeamMutation_notification.graphql'
import {AuthToken} from './types/AuthToken'

(RelayFeatureFlags as any).ENABLE_RELAY_CONTAINERS_SUSPENSE = false

interface QuerySubscription {
  subKey: string
  queryKey: string
  disposable?: ReturnType<GQLTrebuchetClient['subscribe']>
}

interface Subscriptions {
  [subKey: string]: ReturnType<GQLTrebuchetClient['subscribe']>
}

export type SubscriptionRequestor = {
  (
    atmosphere: Atmosphere,
    variables: Variables,
    router: {history: RouterProps['history']}
  ): Disposable,
  key: string
}

export interface FetchHTTPData {
  type: 'start' | 'stop'
  payload: OperationPayload
}

const noop = (): any => {
  /* noop */
}

// used when no sink is provided (not awaiting responses)
const noopSink = {
  next: noop,
  error: noop,
  complete: noop,
  closed: false
}

const toFormData = (
  body: FetchHTTPData,
  formData = new FormData()
) => {
  const uploadables = body.payload.uploadables || []
  delete body.payload.uploadables
  formData.append('body', JSON.stringify(body))
  Object.keys(uploadables).forEach(key => {
    formData.append(`uploadables.${key}`, uploadables[key])
  })
  return formData
}

export interface AtmosphereEvents {
  addSnackbar: (snack: Snack) => void
  removeSnackbar: (filterFn: SnackbarRemoveFn) => void
  focusAgendaInput: () => void
  inviteToTeam: (
    notification: NonNullable<InviteToTeamMutation_notification['teamInvitationNotification']>
  ) => void
  newSubscriptionClient: () => void
  removeGitHubRepo: () => void
}

const store = new Store(new RecordSource())

export default class Atmosphere extends Environment {
  static getKey = (name: string, variables: Variables | undefined) => {
    return JSON.stringify({name, variables})
  }
  _network: typeof Network

  baseHTTPTransport: GQLHTTPClient
  transport!: GQLHTTPClient | GQLTrebuchetClient
  authToken: string | null = null
  authObj: AuthToken | null = null
  querySubscriptions: QuerySubscription[] = []
  queryTimeouts: {
    [queryKey: string]: number
  } = {}
  retries = new Set<() => void>()
  subscriptions: Subscriptions = {}
  eventEmitter: StrictEventEmitter<EventEmitter, AtmosphereEvents> = new EventEmitter()
  queryCache = {} as {[key: string]: GraphQLResponse}
  upgradeTransportPromise: Promise<void> | null = null
  // it's only null before login, so it's just a little white lie
  viewerId: string = null!
  userId: string | null = null // DEPRECATED
  constructor() {
    super({
      store,
      handlerProvider,
      network: Network.create(noop)
    })
    this._network = Network.create(this.handleFetch, this.handleSubscribe) as any
    this.baseHTTPTransport = this.transport = new GQLHTTPClient(this.fetchHTTP)
  }

  fetchPing = async (connectionId?: string) => {
    return fetch('/sse-ping', {
      headers: {
        Authorization: `Bearer ${this.authToken}`,
        'x-correlation-id': connectionId || ''
      }
    })
  }

  fetchReliable = async (connectionId: string, data: ArrayBuffer) => {
    return fetch('/sse-ping', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.authToken}`,
        'x-correlation-id': connectionId || ''
      },
      body: data
    })
  }

  fetchHTTP = async (body: FetchHTTPData, connectionId?: string) => {
    const uploadables = body.payload.uploadables
    const headers = {
      accept: 'application/json',
      Authorization: this.authToken ? `Bearer ${this.authToken}` : '',
      'x-correlation-id': connectionId || '',
    }
    /* if uploadables, don't set content type bc we want the browser to set it */
    if (!uploadables) headers['content-type'] = 'application/json'
    const res = await fetch('/graphql', {
      method: 'POST',
      headers,
      body: uploadables ? toFormData(body) : JSON.stringify(body)
    })
    const contentTypeHeader = res.headers.get('content-type') || ''
    if (contentTypeHeader.toLowerCase().startsWith('application/json')) {
      const resJson = await res.json()
      return resJson
    }
    if (res.status === 401) {
      const text = await res.text()
      if (text === TrebuchetCloseReason.EXPIRED_SESSION) {
        handleInvalidatedSession(TrebuchetCloseReason.EXPIRED_SESSION, {atmosphere: this})
      }
    }
    return null
  }

  handleSubscribePromise = async (
    operation: RequestParameters,
    variables: OperationPayload['variables'] | undefined,
    _cacheConfig: CacheConfig,
    sink: Sink<any>
  ) => {
    const {name} = operation
    const documentId = operation.id || ''
    const subKey = Atmosphere.getKey(name, variables)
    await this.upgradeTransport()
    const transport = this.transport as GQLTrebuchetClient
    if (!transport.subscribe) return
    if (!__PRODUCTION__) {
      try {
        const queryMap = await import('../../queryMap.json')
        const query = queryMap[documentId!]
        this.subscriptions[subKey] = transport.subscribe({query, variables}, sink)
      } catch (e) {
        return
      }

    } else {
      this.subscriptions[subKey] = transport.subscribe({documentId, variables}, sink)
    }
  }

  handleSubscribe: SubscribeFunction = (operation, variables, _cacheConfig) => {
    return Observable.create((sink) => {
      this.handleSubscribePromise(operation, variables, _cacheConfig, sink).catch()
    })
  }

  trySockets = () => {
    const wsProtocol = window.location.protocol.replace('http', 'ws')
    const getUrl = () => {
      this.setAuthToken(this.authToken)
      if (!this.authToken) {
        this.eventEmitter.emit('addSnackbar', {
          autoDismiss: 0,
          key: 'cannotConnectJWT',
          message: 'Session expired. Please refresh to continue',
          action: {
            label: 'Refresh',
            callback: () => {
              window.location.reload()
            }
          }
        })
        return ''
      }
      const host = __PRODUCTION__ ? window.location.host : `${window.location.hostname}:${__SOCKET_PORT__}`
      return `${wsProtocol}//${host}/?token=${this.authToken}`
    }
    return new SocketTrebuchet({getUrl})
  }

  trySSE = () => {
    const getUrl = () => `/sse/?token=${this.authToken}`
    return new SSETrebuchet({getUrl, fetchData: this.fetchHTTP, fetchPing: this.fetchPing, fetchReliable: this.fetchReliable})
  }

  async promiseToUpgrade() {
    const trebuchets = [this.trySockets, this.trySSE]
    const trebuchet = await getTrebuchet(trebuchets)
    if (!trebuchet) {
      this.eventEmitter.emit('addSnackbar', {
        autoDismiss: 0,
        key: 'cannotConnect',
        message:
          'Cannot establish connection. Behind a firewall? Reach out for support: love@parabol.co'
      })
      console.error('Cannot connect!')
      return
    }
    this.transport = new GQLTrebuchetClient(trebuchet)
    this.eventEmitter.emit('newSubscriptionClient')
  }

  async upgradeTransport() {
    // wait until the first and only upgrade has completed
    if (!this.upgradeTransportPromise) {
      this.upgradeTransportPromise = this.promiseToUpgrade()
    }
    return this.upgradeTransportPromise
  }

  handleFetchPromise = async (
    request: RequestParameters,
    variables: Variables,
    uploadables?: UploadableMap | null,
    sink?: Sink<any>
  ) => {
    // await sleep(1000)
    const field = __PRODUCTION__ ? 'documentId' : 'query'
    let data = request.id
    if (!__PRODUCTION__) {
      try {
        const queryMap = await import('../../queryMap.json').catch()
        data = queryMap[request.id!]
      } catch (e) {
        return
      }
    }
    const transport = uploadables ? this.baseHTTPTransport : this.transport
    return transport.fetch({
      [field]: data,
      variables,
      uploadables: uploadables || undefined
    }, sink || noopSink)
  }

  handleFetch: FetchFunction = (request, variables, _, uploadables) => {
    return Observable.create((sink) => {
      this.handleFetchPromise(request, variables, uploadables, sink)
    })
  }

  getAuthToken = (global: Window) => {
    if (!global) return
    const authToken = global.localStorage.getItem(LocalStorageKey.APP_TOKEN_KEY)
    this.setAuthToken(authToken)
  }

  setAuthToken = (authToken: string | null) => {
    this.authToken = authToken
    if (!authToken) {
      this.authObj = null
      window.localStorage.removeItem(LocalStorageKey.APP_TOKEN_KEY)
      return
    }
    try {
      this.authObj = jwtDecode(authToken)
    } catch (e) {
      this.authObj = null
      this.authToken = null
    }

    if (!this.authObj) return
    const {exp, sub: viewerId} = this.authObj
    if (exp < Date.now() / 1000) {
      this.authToken = null
      this.authObj = null
      window.localStorage.removeItem(LocalStorageKey.APP_TOKEN_KEY)
    } else {
      this.viewerId = viewerId!
      window.localStorage.setItem(LocalStorageKey.APP_TOKEN_KEY, authToken)
      // deprecated! will be removed soon
      this.userId = viewerId
    }
  }

  registerQuery = async (
    queryKey: string,
    subscription: SubscriptionRequestor,
    variables: Variables,
    router: {history: RouterProps['history']}
  ) => {
    window.clearTimeout(this.queryTimeouts[queryKey])
    delete this.queryTimeouts[queryKey]
    await this.upgradeTransport()
    const {key} = subscription
    // runtime error in case relay changes
    if (!key) throw new Error(`Missing name for sub`)
    const subKey = Atmosphere.getKey(key, variables)
    const isRequested = Boolean(this.querySubscriptions.find((qs) => qs.subKey === subKey))
    if (!isRequested) {
      subscription(this, variables, router)
    }
    this.querySubscriptions.push({queryKey, subKey})
  }

  /*
   * When a subscription encounters an error, it affects the subscription itself,
   * the queries that depend on that subscription to stay valid,
   * and the peer subscriptions that also keep that component valid.
   *
   * For example, in my app component A subscribes to 1,2,3, component B subscribes to 1, component C subscribes to 2,4.
   * If subscription 1 fails, then the data for component A and B get removed from the queryCache, since it might be invalid now
   * Subscription 1 gets unsubscribed,
   * Subscription 2 does not because it is used by component C.
   * Subscription 3 does because no other component depends on it.
   * Subscription 4 does not because there is no overlap
   */
  scheduleUnregisterQuery(queryKey: string, delay: number) {
    if (this.queryTimeouts[queryKey]) return
    this.queryTimeouts[queryKey] = window.setTimeout(() => {
      this.unregisterQuery(queryKey)
    }, delay)
  }

  /*
   * removes the query & if the subscription is no longer needed, unsubscribes from it
   */
  unregisterQuery(queryKey: string) {
    window.clearTimeout(this.queryTimeouts[queryKey])
    delete this.queryTimeouts[queryKey]
    // for each query that is no longer 100% supported, find the subs that power them
    const rowsToRemove = this.querySubscriptions.filter((qs) => qs.queryKey === queryKey)
    // rowsToRemove.forEach((qsToRemove) => {
    // the query is no longer valid, nuke it
    // delete this.queryCache[qsToRemove.queryKey]
    // })
    const subsToRemove = Array.from(new Set<string>(rowsToRemove.map(({subKey}) => subKey)))
    this.querySubscriptions = this.querySubscriptions.filter((qs) => qs.queryKey !== queryKey)
    subsToRemove.forEach((subKey) => {
      const unaffectedSub = this.querySubscriptions.find((qs) => qs.subKey === subKey)
      if (!unaffectedSub && this.subscriptions[subKey]) {
        // tell the server to unsubscribe
        this.subscriptions[subKey].unsubscribe()
      }
    })
  }

  /* When the server wants to end the subscription, it sends a GQL_COMPLETE payload
   * GQL_Trebuchet cleans itself up & calls the onCompleted observer
   * unregisterSub should therefore be called in each subs onCompleted callback
   */
  unregisterSub(name: string, variables: Variables) {
    const subKey = Atmosphere.getKey(name, variables)
    delete this.subscriptions[subKey]
    const rowsToRemove = this.querySubscriptions.filter((qs) => qs.subKey === subKey)
    rowsToRemove.forEach((qsToRemove) => {
      // the query is no longer valid, nuke it
      delete this.queryCache[qsToRemove.queryKey]
    })
    this.querySubscriptions = this.querySubscriptions.filter((qs) => qs.subKey !== subKey)
    // does not remove other subs because they may still do interesting things like pop toasts
  }

  close() {
    this.querySubscriptions.forEach((querySub) => {
      this.unregisterQuery(querySub.queryKey)
    })
      // remove all records
      ; (this.getStore().getSource() as any).clear()
    this.upgradeTransportPromise = null
    this.authObj = null
    this.authToken = null
    if (this.transport instanceof GQLTrebuchetClient) {
      this.transport.close()
    }
    this.transport = new GQLHTTPClient(this.fetchHTTP)
    this.querySubscriptions = []
    this.subscriptions = {}
    this.viewerId = null!
    this.userId = null // DEPRECATED
  }
}
