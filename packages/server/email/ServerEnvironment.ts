import {FormattedExecutionResult} from 'graphql'
import {Environment, FetchFunction, Network, RecordSource, Store} from 'relay-runtime'
import AuthToken from '../database/types/AuthToken'
import executeGraphQL from '../graphql/executeGraphQL'

const noop = (): any => {
  /**/
}

export default class ServerEnvironment extends Environment {
  requestCache: Promise<FormattedExecutionResult>[] = []
  results: FormattedExecutionResult[] | undefined
  isFetched = false
  authToken: AuthToken
  dataLoaderId: string
  constructor(authToken: AuthToken, dataLoaderId: string) {
    super({
      store: new Store(new RecordSource()),
      network: Network.create(noop)
    })
    ;(this as any)._network = Network.create(this.fetch)
    this.authToken = authToken
    this.dataLoaderId = dataLoaderId
  }

  async load() {
    if (!this.isFetched) {
      this.isFetched = true
      this.results = await Promise.all(this.requestCache)
      this.requestCache = []
    }
  }

  fetch: FetchFunction = (request, variables) => {
    if (!this.isFetched) {
      this.requestCache.push(
        executeGraphQL({
          authToken: this.authToken,
          docId: request.id!,
          variables,
          dataLoaderId: this.dataLoaderId
        })
      )
      return undefined as any
    } else {
      return this.results!.shift()
    }
  }
}
