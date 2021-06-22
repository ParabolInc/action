import {ColumnDefinitions, MigrationBuilder} from 'node-pg-migrate'
import {Client} from 'pg'
import {r} from 'rethinkdb-ts'
import {parse} from 'url'
import getPgConfig from '../getPgConfig'
import {insertGitHubAuthsQuery} from '../queries/generated/insertGitHubAuthsQuery'
export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(): Promise<void> {
  const {hostname: host, port, path} = parse(process.env.RETHINKDB_URL)
  await r.connectPool({
    host,
    port: parseInt(port, 10),
    db: path.split('/')[1]
  })
  const client = new Client(getPgConfig())
  await client.connect()
  const ghIntegrations = await r
    .table('Provider')
    .filter({service: 'GitHubIntegration', isActive: true})
    .filter((row) =>
      row('accessToken')
        .default(null)
        .ne(null)
    )
    .run()
  const auths = ghIntegrations.map(
    ({accessToken, createdAt, isActive, providerUserName, teamId, updatedAt, userId}) => ({
      accessToken,
      createdAt,
      updatedAt,
      isActive,
      login: providerUserName,
      teamId,
      userId
    })
  )
  await client.query(`
    CREATE TABLE IF NOT EXISTS "GitHubAuth" (
      "accessToken" VARCHAR(40) NOT NULL,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "isActive" BOOLEAN DEFAULT TRUE NOT NULL,
      "login" VARCHAR(200) NOT NULL,
      "teamId" VARCHAR(100) NOT NULL,
      "userId" VARCHAR(100) NOT NULL,
      PRIMARY KEY ("userId", "teamId")
    );
  `)
  if (auths.length) {
    await insertGitHubAuthsQuery.run({auths}, client)
  }
  await client.end()
  await r.getPoolMaster().drain()
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`DROP TABLE "GitHubAuth";`)
}
