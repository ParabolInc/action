require('./utils/dotenv')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const getWebpackPublicPath = require('./utils/getWebpackPublicPath')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const S3Plugin = require('webpack-s3-plugin')
const getS3BasePath = require('./utils/getS3BasePath')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const {InjectManifest} = require('wrkbx')
const CopyPlugin = require('copy-webpack-plugin')
const getProjectRoot = require('./utils/getProjectRoot')

const PROJECT_ROOT = getProjectRoot()
const CLIENT_ROOT = path.join(PROJECT_ROOT, 'packages', 'client')
const STATIC_ROOT = path.join(PROJECT_ROOT, 'static')
const buildPath = path.join(PROJECT_ROOT, 'build')
const publicPath = getWebpackPublicPath()

// babel-plugin-relay requires a prod BABEL_ENV to remove hash checking logic. Probably a bug in the package.
process.env.BABEL_ENV = 'production'

const babelPresets = [
  [
    '@babel/preset-env',
    {
      targets: {
        browsers: ['> 1%', 'not ie 11']
      },
      bugfixes: true,
      // debug: true,
      corejs: 3,
      useBuiltIns: 'entry'
    }
  ]
]

module.exports = ({isDeploy, isStats}) => ({
  stats: {
    assets: false
  },
  mode: 'production',
  entry: {
    app: [path.join(CLIENT_ROOT, 'polyfills.ts'), path.join(CLIENT_ROOT, 'client.tsx')]
  },
  output: {
    path: buildPath,
    publicPath,
    filename: '[name]_[contenthash].js',
    chunkFilename: '[name]_[contenthash].js',
    crossOriginLoading: 'anonymous'
  },
  resolve: {
    alias: {
      '~': CLIENT_ROOT,
      'parabol-client': CLIENT_ROOT,
      static: STATIC_ROOT
    },
    extensions: ['.js', '.json', '.ts', '.tsx', '.graphql'],
    fallback: {
      assert: path.join(PROJECT_ROOT, 'scripts/webpack/assert.js'),
      os: false
    },
    modules: [
      path.resolve(CLIENT_ROOT, '../node_modules'),
      'node_modules'
    ]
  },
  resolveLoader: {
    modules: [
      path.resolve(CLIENT_ROOT, '../node_modules'),
      'node_modules'
    ]
  },
  optimization: {
    minimize: Boolean(isDeploy || isStats),
    minimizer: [
      new TerserPlugin({
        parallel: isDeploy ? 2 : true,
        terserOptions: {
          output: {
            comments: false,
            ecma: 6
          },
          compress: {
            ecma: 6
          }
          // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
        }
      })
    ]
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.join(PROJECT_ROOT, 'static', 'manifest.json'),
          to: buildPath
        }
      ]
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.join(PROJECT_ROOT, 'template.html'),
      title: 'Free Online Retrospectives | Parabol'
    }),
    new ScriptExtHtmlWebpackPlugin({
      custom: {
        test: /\.js$/,
        attribute: 'onerror',
        value: 'fallback(this)'
      }
    }),
    new ScriptExtHtmlWebpackPlugin({
      custom: {
        test: /\.js$/,
        attribute: 'crossorigin',
        value: ''
      }
    }),
    new CleanWebpackPlugin(),
    new webpack.DefinePlugin({
      __CLIENT__: true,
      __PRODUCTION__: true,
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      'process.env.DEBUG': false,
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env.PROTOO_LISTEN_PORT': JSON.stringify(
        (process.env.PROTOO_LISTEN_PORT || 4444) - 1
      ),
      __STATIC_IMAGES__: JSON.stringify(`https://${process.env.AWS_S3_BUCKET}/static`)
    }),
    new webpack.SourceMapDevToolPlugin({
      filename: '[name]_[contenthash].js.map',
      append: `\n//# sourceMappingURL=${publicPath}[url]`
    }),
    new InjectManifest({
      swSrc: 'sw.js',
      entry: path.join(PROJECT_ROOT, 'packages/client/serviceWorker/sw.ts'),
      swDest: 'sw.js',
      importWorkboxFrom: 'disabled',
      exclude: [/GraphqlContainer/, /\.map$/, /^manifest.*\.js$/, /index.html$/]
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
      directory: buildPath
    }),
    isStats && new BundleAnalyzerPlugin({generateStatsFile: true})
  ].filter(Boolean),
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        // things that need the relay plugin
        include: [path.join(CLIENT_ROOT)],
        // but don't need the inline-import plugin
        exclude: [path.join(CLIENT_ROOT, 'utils/GitHubManager.ts')],
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              babelrc: false,
              presets: babelPresets,
              plugins: [
                [
                  'macros',
                  {
                    relay: {
                      artifactDirectory: path.join(CLIENT_ROOT, '__generated__')
                    }
                  }
                ]
              ]
            }
          },
          {
            loader: '@sucrase/webpack-loader',
            options: {
              transforms: ['jsx', 'typescript']
            }
          }
        ]
      },
      {
        test: /GitHubManager\.ts/,
        // things that need inline-import
        include: path.join(CLIENT_ROOT, 'utils'),
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              babelrc: false,
              presets: babelPresets,
              plugins: [
                [
                  'inline-import',
                  {
                    extensions: ['.graphql']
                  }
                ]
              ]
            }
          },
          {
            loader: '@sucrase/webpack-loader',
            options: {
              transforms: ['jsx', 'typescript']
            }
          }
        ]
      },
      {
        test: /\.js$/,
        include: [path.join(CLIENT_ROOT)],
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              babelrc: false,
              presets: babelPresets,
              plugins: [
                [
                  'macros',
                  {
                    relay: {
                      artifactDirectory: path.join(CLIENT_ROOT, '__generated__')
                    }
                  }
                ]
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
      {test: /\.flow$/, loader: 'ignore-loader'},
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
      // for graphiql, since graphql uses mjs files to run in the server
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto'
      },
      {
        test: /\.(eot|ttf|wav|mp3|woff|woff2|otf)$/,
        use: ['file-loader']
      }
    ]
  }
})
