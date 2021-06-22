const relayCompiler = () => {
  const relayConfig = require('relay-config')
  const config = relayConfig.loadConfig()
  const safeConfig = JSON.parse(JSON.stringify(config))
  safeConfig.watch = true
  safeConfig.watchman = true
  const {relayCompiler} = require('relay-compiler')
  relayCompiler(safeConfig)
}

relayCompiler()
