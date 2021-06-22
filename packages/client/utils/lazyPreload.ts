/* Puts a preload method on every lazy component */
import {ComponentType, lazy, LazyExoticComponent} from 'react'

type ImportThunk<T> = () => Promise<{default: T}>

export interface LazyExoticPreload<T extends ComponentType<any>> extends LazyExoticComponent<T> {
  preload: ImportThunk<T>
}

const lazyPreload = <T extends ComponentType<any>>(thunk: ImportThunk<T>) => {
  const lazyComponent = lazy(thunk) as LazyExoticPreload<T>
  lazyComponent.preload = thunk
  return lazyComponent
}

export default lazyPreload
