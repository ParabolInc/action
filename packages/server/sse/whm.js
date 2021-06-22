module.exports = webpackHotMiddleware

function webpackHotMiddleware(compiler, opts) {
  opts = opts || {}
  opts.log =
    typeof opts.log == 'undefined' ? console.log.bind(console) : opts.log
  opts.path = opts.path || '/__webpack_hmr'
  opts.heartbeat = opts.heartbeat || 10 * 1000

  var eventStream = createEventStream(opts.heartbeat)
  var latestStats = null
  var closed = false

  if (compiler.hooks) {
    compiler.hooks.invalid.tap('webpack-hot-middleware', onInvalid)
    compiler.hooks.done.tap('webpack-hot-middleware', onDone)
  } else {
    compiler.plugin('invalid', onInvalid)
    compiler.plugin('done', onDone)
  }
  function onInvalid() {
    if (closed) return
    latestStats = null
    if (opts.log) opts.log('webpack building...')
    eventStream.publish({action: 'building'})
  }
  function onDone(statsResult) {
    if (closed) return
    // Keep hold of latest stats so they can be propagated to new clients
    latestStats = statsResult
    publishStats('built', latestStats, eventStream, opts.log)
  }
  var middleware = function (req, res, next) {
    if (closed) return next()
    if (!req.url.includes(opts.path)) return next()
    // if (!pathMatch(req.url, opts.path)) return next()
    eventStream.handler(req, res)
    if (latestStats) {
      // Explicitly not passing in `log` fn as we don't want to log again on
      // the server
      publishStats('sync', latestStats, eventStream)
    }
  }
  middleware.publish = function (payload) {
    if (closed) return
    eventStream.publish(payload)
  }
  middleware.close = function () {
    if (closed) return
    // Can't remove compiler plugins, so we just set a flag and noop if closed
    // https://github.com/webpack/tapable/issues/32#issuecomment-350644466
    closed = true
    eventStream.close()
    eventStream = null
  }
  return middleware
}

function createEventStream(heartbeat) {
  const clients = []
  function everyClient(fn) {
    clients.forEach((client) => {
      if (client.done) {
        clients.splice(clients.indexOf(client), 1)
      } else {
        fn(client)
      }
    })
  }
  var interval = setInterval(function heartbeatTick() {
    everyClient(function (client) {
      client.tryEnd('data: \uD83D\uDC93\n\n', 1e8)
    })
  }, heartbeat).unref()
  return {
    close: function () {
      clearInterval(interval)
      everyClient(function (client) {
        client.end()
      })
      clients.length = 0
    },
    handler: function (_req, res) {
      if (res.done) return
      res.writeHeader('Access-Control-Allow-Origin', '*')
      res.writeHeader('Content-Type', 'text/event-stream;charset=utf-8')
      res.writeHeader('Connection', 'keep-alive')
      res.writeHeader('Cache-Control', 'no-cache, no-transform')
      res.writeHeader('X-Accel-Buffering', 'no')
      res.tryEnd(`retry: 1000\n`, 1e8)
      res.tryEnd('\n', 1e8)
      clients.push(res)
      res.onAborted(() => {
        clients.splice(clients.indexOf(res), 1)
      })
    },
    publish: function (payload) {
      everyClient(function (client) {
        client.tryEnd('data: ' + JSON.stringify(payload) + '\n\n', 1e8)
      })
    },
  }
}

function publishStats(action, statsResult, eventStream, log) {
  var stats = statsResult.toJson({
    all: false,
    cached: true,
    children: true,
    modules: true,
    timings: true,
    hash: true,
  })
  // For multi-compiler, stats will be an object with a 'children' array of stats
  var bundles = extractBundles(stats)
  bundles.forEach(function (stats) {
    var name = stats.name || ''

    // Fallback to compilation name in case of 1 bundle (if it exists)
    if (bundles.length === 1 && !name && statsResult.compilation) {
      name = statsResult.compilation.name || ''
    }

    if (log) {
      log(
        'webpack built ' +
        (name ? name + ' ' : '') +
        stats.hash +
        ' in ' +
        stats.time +
        'ms'
      )
    }
    eventStream.publish({
      name: name,
      action: action,
      time: stats.time,
      hash: stats.hash,
      warnings: stats.warnings || [],
      errors: stats.errors || [],
      modules: buildModuleMap(stats.modules),
    })
  })
}

function extractBundles(stats) {
  // Stats has modules, single bundle
  if (stats.modules) return [stats]

  // Stats has children, multiple bundles
  if (stats.children && stats.children.length) return stats.children

  // Not sure, assume single
  return [stats]
}

function buildModuleMap(modules) {
  var map = {}
  modules.forEach(function (module) {
    map[module.id] = module.name
  })
  return map
}
