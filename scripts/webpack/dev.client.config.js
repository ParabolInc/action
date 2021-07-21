require('./utils/dotenv')
const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const vendors = require('../../dev/dll/vendors')
const clientTransformRules = require('./utils/clientTransformRules')
const getProjectRoot = require('./utils/getProjectRoot')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')

const PROJECT_ROOT = getProjectRoot()
const CLIENT_ROOT = path.join(PROJECT_ROOT, 'packages', 'client')
const STATIC_ROOT = path.join(PROJECT_ROOT, 'static')
const {PORT, SOCKET_PORT} = process.env

const USE_REFRESH = false
module.exports = {
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename]
    }
  },
  devServer: {
    index: 'index.html',
    clientLogLevel: 'silent',
    contentBase: [
      path.join(PROJECT_ROOT, 'static'),
      path.join(PROJECT_ROOT, 'build'),
      path.join(PROJECT_ROOT, 'dev', 'dll'),
      path.join(PROJECT_ROOT, 'self-hosted')
    ],
    contentBasePublicPath: ['/static/', '/static/', '/static/', '/self-hosted/'],
    publicPath: '/',
    hot: true,
    historyApiFallback: true,
    stats: 'minimal',
    port: PORT,
    proxy: {
      '/graphql': {
        target: `http://localhost:${SOCKET_PORT}`
      },
      '/intranet-graphql': {
        target: `http://localhost:${SOCKET_PORT}`
      },
      '/sse': {
        target: `http://localhost:${SOCKET_PORT}`
      },
      '/sse-ping': {
        target: `http://localhost:${SOCKET_PORT}`
      },
      '/jira-attachements': {
        target: `http://localhost:${SOCKET_PORT}`
      }
    }
  },
  infrastructureLogging: {level: 'warn'},
  watchOptions: {
    ignored: /node_modules/
    // aggregateTimeout: 200,
  },
  devtool: 'eval-source-map',
  mode: 'development',
  entry: {
    app: [path.join(CLIENT_ROOT, 'client.tsx')]
  },
  optimization: {
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false,
    runtimeChunk: true
  },
  output: {
    path: path.join(PROJECT_ROOT, 'build'),
    filename: '[name].js',
    chunkFilename: '[name].chunk.js',
    publicPath: '/'
  },
  resolve: {
    alias: {
      '~': CLIENT_ROOT,
      'parabol-client': CLIENT_ROOT,
      static: STATIC_ROOT
    },
    extensions: ['.js', '.json', '.ts', '.tsx'],
    fallback: {
      assert: false,
      os: false
    },
    unsafeCache: true,
    modules: [path.resolve(CLIENT_ROOT, '../node_modules'), 'node_modules'],
    symlinks: false
  },
  resolveLoader: {
    modules: [path.resolve(CLIENT_ROOT, '../node_modules'), 'node_modules']
  },
  plugins: [
    new webpack.DllReferencePlugin({
      manifest: vendors
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.join(PROJECT_ROOT, 'devTemplate.html'),
      __ACTION__: JSON.stringify({
        atlassian: process.env.ATLASSIAN_CLIENT_ID,
        github: process.env.GITHUB_CLIENT_ID,
        google: process.env.GOOGLE_OAUTH_CLIENT_ID,
        logRocket: process.env.LOG_ROCKET,
        segment: process.env.SEGMENT_WRITE_KEY,
        sentry: process.env.SENTRY_DSN,
        slack: process.env.SLACK_CLIENT_ID,
        stripe: process.env.STRIPE_PUBLISHABLE_KEY,
        prblIn: process.env.INVITATION_SHORTLINK
      })
    }),
    new ReactRefreshWebpackPlugin(),
    new webpack.DefinePlugin({
      __CLIENT__: true,
      __PRODUCTION__: false,
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      'process.env.NODE_ENV': JSON.stringify('development'),
      'process.env.DEBUG': JSON.stringify(process.env.DEBUG),
      'process.env.PROTOO_LISTEN_PORT': JSON.stringify(process.env.PROTOO_LISTEN_PORT || 4444),
      __SOCKET_PORT__: JSON.stringify(process.env.SOCKET_PORT),
      __STATIC_IMAGES__: JSON.stringify(`/static/images`)
    }),
    new webpack.HotModuleReplacementPlugin()
  ],
  module: {
    rules: [
      ...clientTransformRules(PROJECT_ROOT, USE_REFRESH),
      {
        test: /\.js$/,
        include: [path.join(CLIENT_ROOT)],
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              babelrc: false,
              plugins: [
                [
                  'macros',
                  {
                    relay: {
                      artifactDirectory: path.join(CLIENT_ROOT, '__generated__')
                    }
                  }
                ],
                'react-refresh/babel'
              ]
            }
          },
          {
            loader: '@sucrase/webpack-loader',
            options: {
              transforms: ['jsx']
            }
          }
        ]
      },
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 4096
            }
          }
        ]
      },
      {
        test: /\.(eot|ttf|wav|mp3|woff|woff2|otf)$/,
        use: ['file-loader']
      },
      // https://github.com/graphql/graphiql/issues/1055#issuecomment-561353578
      {
        test: /\/__tests__\//i,
        use: ['ignore-loader']
      }
    ]
  }
}
