const path = require('path')
const nodeExternals = require('webpack-node-externals')
const transformRules = require('./utils/transformRules')
const getProjectRoot = require('./utils/getProjectRoot')
const S3Plugin = require('webpack-s3-plugin')
const getS3BasePath = require('./utils/getS3BasePath')
const webpack = require('webpack')
const getWebpackPublicPath = require('./utils/getWebpackPublicPath')

const PROJECT_ROOT = getProjectRoot()
const CLIENT_ROOT = path.join(PROJECT_ROOT, 'packages', 'client')
const SERVER_ROOT = path.join(PROJECT_ROOT, 'packages', 'server')
const GQL_ROOT = path.join(PROJECT_ROOT, 'packages', 'gql-executor')
const SFU_ROOT = path.join(PROJECT_ROOT, 'packages', 'sfu')
const DOTENV = path.join(PROJECT_ROOT, 'scripts/webpack/utils/dotenv.js')
const publicPath = getWebpackPublicPath()
const distPath = path.join(PROJECT_ROOT, 'dist')

module.exports = ({isDeploy}) => ({
  mode: 'production',
  node: {
    __dirname: false
  },
  entry: {
    web: [DOTENV, path.join(SERVER_ROOT, 'server.ts')],
    gqlExecutor: [DOTENV, path.join(GQL_ROOT, 'gqlExecutor.ts')],
    sfu: [DOTENV, path.join(SFU_ROOT, 'server.ts')]
  },
  output: {
    filename: '[name].js',
    path: path.join(PROJECT_ROOT, 'dist')
  },
  resolve: {
    alias: {
      '~': CLIENT_ROOT,
      'parabol-client': CLIENT_ROOT,
      'parabol-server': SERVER_ROOT
    },
    extensions: ['.js', '.json', '.ts', '.tsx'],
    // this is run outside the server dir, but we want to favor using modules from the server dir
    modules: [path.resolve(SERVER_ROOT, '../node_modules'), 'node_modules']
  },
  resolveLoader: {
    modules: [path.resolve(SERVER_ROOT, '../node_modules'), 'node_modules']
  },
  target: 'node',
  externals: [
    nodeExternals({
      allowlist: [/parabol-client/, /parabol-server/]
    })
  ],
  plugins: [
    new webpack.SourceMapDevToolPlugin({
      filename: '[name]_[contenthash].js.map',
      append: `\n//# sourceMappingURL=${publicPath}[url]`
    }),
    isDeploy &&
    new S3Plugin({
      s3Options: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION
      },
      s3UploadOptions: {
        Bucket: process.env.AWS_S3_BUCKET
      },
      basePath: getS3BasePath(),
      directory: distPath
    })
  ].filter(Boolean),
  module: {
    rules: [
      ...transformRules(PROJECT_ROOT),
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        use: ['ignore-loader']
      }
    ]
  }
})
