const pgmPostDeployConfig = {
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB,
  tsconfig: 'packages/server/tsconfig.json',
  'migrations-dir': 'packages/server/postgres/migrations/postDeploy',
  'migrations-table': 'PgPostDeployMigrations',
}

module.exports = pgmPostDeployConfig
