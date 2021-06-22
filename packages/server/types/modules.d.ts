// this is just to get typescript to stop complaining about imports
// declare module '*'
declare module '*.png'

declare module '*.svg'

declare const __PRODUCTION__: string
declare const __STATIC_IMAGES__: string
declare const __SOCKET_PORT__: string
interface Window {
  __ACTION__: any
}

declare namespace NodeJS {
  interface Global {
    hmrMiddleware: any
    hmrSchema: any
  }
  interface NodeModule {
    hot: any
  }
}

interface HotMod extends NodeJS.Module {
  hot: {
    accept: any
  }
}

declare let module: HotMod
declare type Json = null | boolean | number | string | Json[] | {[key: string]: Json}
