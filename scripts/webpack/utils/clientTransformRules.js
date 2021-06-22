const path = require('path')

const clientTransformRules = (projectRoot, USE_REFRESH) => {
  const CLIENT_ROOT = path.join(projectRoot, 'packages', 'client')
  return [
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
            plugins: [
              [
                'macros',
                {
                  relay: {
                    artifactDirectory: path.join(CLIENT_ROOT, '__generated__')
                  }
                }
              ],
              'react-refresh/babel',
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

module.exports = clientTransformRules
