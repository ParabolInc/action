module.exports = {
  apps: [
    {
      name: 'GQL/Socket Server',
      script: 'scripts/gqlServers.js',
      instances: 1,
      autorestart: true,
      watch: ['packages/server'],
      max_memory_restart: '3000M',
      env_production: {
        NODE_ENV: 'development'
      }
    },
    {
      name: 'Web Server',
      script: 'scripts/hmrServer.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '3000M',
      env_production: {
        NODE_ENV: 'development'
      }
    },
    {
      name: 'Relay Compiler',
      script: 'scripts/relayCompiler.js',
      instances: 1,
      autorestart: true,
      watch: ['schema.graphql'],
      max_memory_restart: '3000M',
      env_production: {
        NODE_ENV: 'development'
      }
    },
  ]
}
