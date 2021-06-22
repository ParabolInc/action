const APP_NAME = 'mediasoup-parabol'

declare namespace debug {
  interface Debug {
    (namespace: string): Debugger
    coerce: (val: any) => any
    disable: () => string
    enable: (namespaces: string) => void
    enabled: (namespaces: string) => boolean
    log: (...args: any[]) => any

    names: RegExp[]
    skips: RegExp[]

    formatters: Formatters
  }

  type IDebug = Debug

  interface Formatters {
    [formatter: string]: (v: any) => string
  }

  type IDebugger = Debugger

  interface Debugger {
    (formatter: any, ...args: any[]): void

    color: string
    enabled: boolean
    log: (...args: any[]) => any
    namespace: string
    destroy: () => boolean
    extend: (namespace: string, delimiter?: string) => Debugger
  }
}

class NoOpLogger {
  debug: () => void
  info: () => void
  warn: () => void
  error: () => void

  constructor() {
    this.debug = () => {}
    this.info = () => {}
    this.warn = () => {}
    this.error = () => {}
  }
}

class DebugLogger {
  debug: debug.Debugger
  info: debug.Debugger
  warn: debug.Debugger
  error: debug.Debugger

  static async create(prefix?: string) {
    const {default: debugConstructor} = await import('debug')
    return new DebugLogger(debugConstructor, prefix)
  }

  constructor(debugConstructor: debug.Debug, prefix?: string) {
    this.debug = debugConstructor(prefix ? `${APP_NAME}:${prefix}` : `${APP_NAME}`)
    this.info = debugConstructor(prefix ? `${APP_NAME}:INFO:${prefix}` : `${APP_NAME}:INFO`)
    this.warn = debugConstructor(prefix ? `${APP_NAME}:WARN:${prefix}` : `${APP_NAME}:WARN`)
    this.error = debugConstructor(prefix ? `${APP_NAME}:ERROR:${prefix}` : `${APP_NAME}:ERROR`)
    this.debug.log = console.info.bind(console)
    this.info.log = console.info.bind(console)
    this.warn.log = console.warn.bind(console)
    this.error.log = console.error.bind(console)
  }
}

const LoggerFactory = async (prefix?: string) => {
  const debug = typeof process.env.DEBUG === 'string' && process.env.DEBUG.startsWith('mediasoup')
  if (debug) return await DebugLogger.create(prefix)
  return new NoOpLogger()
}

export default LoggerFactory
