import {GraphQLFieldConfig} from 'graphql'
import AuthToken from '../database/types/AuthToken'
import RethinkDataLoader from '../dataloader/RethinkDataLoader'
import {CacheWorker} from './DataLoaderCache'
import RateLimiter from './RateLimiter'

// Avoid needless parsing & validating for the 300 hottest operations
export type DataLoaderWorker = CacheWorker<RethinkDataLoader>

export interface GQLContext {
  authToken: AuthToken
  rateLimiter: RateLimiter
  ip: string
  socketId: string
  dataLoader: DataLoaderWorker
}

export interface InternalContext {
  dataLoader: DataLoaderWorker
  authToken: AuthToken
}

export type GQLMutation = GraphQLFieldConfig<undefined, GQLContext> & {name: string}
