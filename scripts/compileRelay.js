const compileRelay = async (isWatch) => {
  const relayConfig = require('relay-config')
  const config = relayConfig.loadConfig()
  const safeConfig = JSON.parse(JSON.stringify(config))
  if (isWatch) {
    safeConfig.watch = true
    safeConfig.watchman = true
  }
  const {relayCompiler} = require('relay-compiler')
  await relayCompiler(safeConfig)
}

if (require.main === module) {
  const isWatch = process.argv[2] !== '-r'
  compileRelay(isWatch)
}

module.exports = compileRelay
