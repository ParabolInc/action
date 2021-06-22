const webpack = require('webpack')

const gqlServers = async () => {
  await new Promise((resolve) => {
    const config = require('./webpack/dev.servers.config')
    const compiler = webpack(config)
    // const start = Date.now()
    compiler.run(() => {
      // console./log('servers done', (Date.now() - start) / 1000)
      resolve()
    })
  })
  require('../dev/web.js')
  require('../dev/gqlExecutor.js')
}

gqlServers()
