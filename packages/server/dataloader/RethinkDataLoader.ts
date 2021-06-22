import DataLoader from 'dataloader'
import {DBType} from '../database/rethinkDriver'
import * as customLoaderMakers from './customLoaderMakers'
import fkLoader from './fkLoader'
import * as foreignLoaderMakers from './foreignLoaderMakers'
import LoaderMakerForeign from './LoaderMakerForeign'
import LoaderMakerPrimary from './LoaderMakerPrimary'
import pkLoader from './pkLoader'
import * as primaryLoaderMakers from './primaryLoaderMakers'

interface LoaderDict {
  [loaderName: string]: DataLoader<any, any>
}

const loaderMakers = {
  ...primaryLoaderMakers,
  ...foreignLoaderMakers,
  ...customLoaderMakers
} as const

type LoaderMakers = typeof loaderMakers
type Loaders = keyof LoaderMakers

type PrimaryLoaderMakers = typeof primaryLoaderMakers
type PrimaryLoaders = keyof PrimaryLoaderMakers
type Unprimary<T> = T extends LoaderMakerPrimary<infer U> ? DBType[U] : never
type TypeFromPrimary<T extends PrimaryLoaders> = Unprimary<PrimaryLoaderMakers[T]>

type ForeignLoaderMakers = typeof foreignLoaderMakers
type ForeignLoaders = keyof ForeignLoaderMakers
type Unforeign<T> = T extends LoaderMakerForeign<infer U> ? U : never
type TypeFromForeign<T extends ForeignLoaders> = TypeFromPrimary<Unforeign<ForeignLoaderMakers[T]>>

type CustomLoaderMakers = typeof customLoaderMakers
type CustomLoaders = keyof CustomLoaderMakers
type Uncustom<T> = T extends (parent: RethinkDataLoader) => infer U ? U : never
type TypeFromCustom<T extends CustomLoaders> = Uncustom<CustomLoaderMakers[T]>

type TypedDataLoader<LoaderName> = LoaderName extends CustomLoaders
  ? TypeFromCustom<LoaderName>
  : DataLoader<
      string,
      LoaderName extends ForeignLoaders
        ? TypeFromForeign<LoaderName>[]
        : LoaderName extends PrimaryLoaders
        ? TypeFromPrimary<LoaderName>
        : never
    >

export default class RethinkDataLoader {
  dataLoaderOptions: DataLoader.Options<any, any>
  loaders: LoaderDict = {}
  constructor(dataLoaderOptions: DataLoader.Options<any, any> = {}) {
    this.dataLoaderOptions = dataLoaderOptions
  }

  get<LoaderName extends Loaders>(loaderName: LoaderName) {
    let loader = this.loaders[loaderName]
    if (loader) return loader as TypedDataLoader<LoaderName>
    const loaderMaker = loaderMakers[loaderName]
    if (loaderMaker instanceof LoaderMakerPrimary) {
      const {table} = loaderMaker
      loader = pkLoader(this.dataLoaderOptions, table)
      this.loaders[loaderName]
    } else if (loaderMaker instanceof LoaderMakerForeign) {
      const {fetch, field, pk} = loaderMaker
      const basePkLoader = this.get(pk as PrimaryLoaders)
      loader = fkLoader(basePkLoader, this.dataLoaderOptions, field, fetch)
    } else {
      loader = (loaderMaker as any)(this)
    }
    this.loaders[loaderName] = loader
    return loader as TypedDataLoader<LoaderName>
  }
}
