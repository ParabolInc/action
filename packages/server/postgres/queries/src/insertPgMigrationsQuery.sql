/*
  @name insertPgMigrationsQuery
  @param migrationRows -> ((name, run_on)...)
*/
INSERT INTO "PgMigrations" (
  "name",
  "run_on"
) VALUES :migrationRows;
