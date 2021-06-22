const path = require('path')

const transformRules = (projectRoot) => {
  const CLIENT_ROOT = path.join(projectRoot, 'packages', 'client')
  const SERVER_ROOT = path.join(projectRoot, 'packages', 'server')
  const GQL_ROOT = path.join(projectRoot, 'packages', 'gql-executor')
  const SFU_ROOT = path.join(projectRoot, 'packages', 'sfu')
  const TOOLBOX_SRC = path.join(projectRoot, 'scripts', 'toolboxSrc')
  return [
    {
      test: /\.tsx?$/,
      // things that need the relay plugin
      include: [path.join(SERVER_ROOT, 'email'), path.join(CLIENT_ROOT)],
      // but don't need the inline-import plugin
      exclude: [path.join(CLIENT_ROOT, 'utils/GitHubManager.ts')],
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
      test: /\.tsx?/,
      // things that don't need babel
      include: [SERVER_ROOT, GQL_ROOT, SFU_ROOT, TOOLBOX_SRC],
      // things that need babel
      exclude: path.join(SERVER_ROOT, 'email'),
      use: {
        loader: '@sucrase/webpack-loader',
        options: {
          transforms: ['jsx', 'typescript']
        }
      }
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
    }
  ]
}

module.exports = transformRules
