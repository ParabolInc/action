/*
 * To create fixtures:
 * Set the DB to test in the server .env
 * Migrate the DB: `yarn db:migrate`
 * Run a signup (manually, cypress@parabol.co, PW: cypress)
 * Update the userId to match the newly created user in ../support/commands.ts L40
 * Set durability to soft: `node scripts/toolbox/softenDurability.js`
 * Clone DB to another DB namespace 'cypress': `node packages/server/database/cloneTestToCypress.babel.js`
 * Dump test and cypress DBs to rdb_test.tar.gz: `docker run --rm --network="container:$(docker ps | grep 'rethinkdb:latest' | awk '{print $1}')" -v $(pwd):/backup petecoop/rethinkdb-driver rethinkdb-dump -c 127.0.0.1:28015 -f /backup/packages/cypress/fixtures/rdb_test2.tar.gz -e test -e cypress`
 * FOR MACOS (WITHOUT DOCKER): `rethinkdb-dump -f packages/cypress/fixtures/rdb_test2.tar.gz -e test -e cypress`
 * `chown $USER packages/cypress/fixtures/rdb_test2.tar.gz && rm packages/cypress/fixtures/rdb_test.tar.gz && mv packages/cypress/fixtures/rdb_test2.tar.gz packages/cypress/fixtures/rdb_test.tar.gz`
 */
