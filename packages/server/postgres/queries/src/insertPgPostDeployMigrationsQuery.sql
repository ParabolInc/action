/*
  @name insertPgPostDeployMigrationsQuery
  @param migrationRows -> ((name, run_on)...)
*/
INSERT INTO "PgPostDeployMigrations" (
  "name",
  "run_on"
) VALUES :migrationRows;
