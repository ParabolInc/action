// this is just to get typescript to stop complaining about imports
// declare module '*'
declare module '*.jpeg'
declare module '*.png' {
  const value: string
  export = value
}
declare module '*.svg'
declare module '*.woff2'

declare const __PRODUCTION__: string
declare const __APP_VERSION__: string
declare const __STATIC_IMAGES__: string
declare const __SOCKET_PORT__: string
interface Window {
  __ACTION__: any
}
declare type Json = null | boolean | number | string | Json[] | {[key: string]: Json}
