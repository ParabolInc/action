const path = require('path')

module.exports = {
  artifactDirectory: path.join(__dirname, 'packages/client/__generated__'),
  clientSchema: path.join(__dirname, 'packages/client/clientSchema.graphql'),
  persistFunction: path.join(__dirname, 'packages/server/graphql/persistFunction.js'),
  persistOutput: path.join(__dirname, 'queryMap.json'),
  language: 'typescript',
  src: path.join(__dirname, 'packages'),
  customScalars: {
    Email: 'string',
    DateTime: 'string',
    URL: 'string'
  },
  extensions: ['js', 'ts', 'tsx'],
  noFutureProofEnums: true,
  schema: path.join(__dirname, 'schema.graphql'),
  include: ['client/**'],
  exclude: [
    '**/lib/**',
    '**/node_modules/**',
    '**/githubSchema.graphql',
    '**/githubQueries/**',
    '**/__generated__/**'
  ],
  // quiet: true,
  watchman: false
}
