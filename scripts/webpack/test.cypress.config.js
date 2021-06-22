const path = require('path')
const getProjectRoot = require('./utils/getProjectRoot')

const PROJECT_ROOT = getProjectRoot()
const CLIENT_ROOT = path.join(PROJECT_ROOT, 'packages', 'client')
const SERVER_ROOT = path.join(PROJECT_ROOT, 'packages', 'server')
const CYPRESS_ROOT = path.join(PROJECT_ROOT, 'packages', 'cypress')
// const GQL_ROOT = path.join(PROJECT_ROOT, 'packages', 'gql-executor')
// const DOTENV = path.join(PROJECT_ROOT, 'scripts', 'webpack', 'utils', 'dotenv.js')

module.exports = {
  resolve: {
    extensions: ['.js', '.json', '.ts', '.tsx'],
    alias: {
      '~': path.join(CLIENT_ROOT),
      'parabol-server': SERVER_ROOT,
      'parabol-client': CLIENT_ROOT,
    },
    unsafeCache: true,
    fallback: {
      //   os: false,
      crypto: 'crypto-browserify',
      util: require.resolve('util'),
      stream: 'stream-browserify'
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        include: [CYPRESS_ROOT, SERVER_ROOT, CLIENT_ROOT],
        use: {
          loader: '@sucrase/webpack-loader',
          options: {
            transforms: ['imports', 'jsx', 'typescript']
          }
        }
      }
    ]
  }
}
