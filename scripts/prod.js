const webpack = require('webpack')
const toolboxConfig = require('./webpack/toolbox.config')
const makeServersConfig = require('./webpack/prod.servers.config')
const makeClientConfig = require('./webpack/prod.client.config')

const compile = (config, isSilent) => {
  return new Promise((resolve) => {
    const cb = (err, stats) => {
      if (err && !isSilent) {
        console.log('Webpack error:', err)
      }
      const {errors} = stats.compilation
      if (errors.length > 0 && !isSilent) {
        console.log('COMPILATION ERRORS:', errors)
      }
      resolve()
    }
    const compiler = webpack(config)
    compiler.run(cb)
  })
}

const prod = async (isDeploy) => {
  console.log('🙏🙏🙏      Building Production Server      🙏🙏🙏')
  await compile(toolboxConfig, true)
  await require('./toolbox/updateSchema.js').default()
  await require('./compileRelay')()
  const serversConfig = makeServersConfig({isDeploy})
  const clientConfig = makeClientConfig({isDeploy})
  await Promise.all([compile(serversConfig), compile(clientConfig)])
  if (!isDeploy) {
    require('./toolbox/postDeploy.js')
  }
}

if (require.main === module) {
  const isDeploy = process.argv[2] === '--deploy'
  prod(isDeploy)
}
