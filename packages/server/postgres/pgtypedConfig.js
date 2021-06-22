require('dotenv').config()

const emitTemplateTarget = "packages/server/postgres/queries/generated/{{name}}.ts"

const pgtypedConfig = {
  "transforms": [
    {
      "mode": "sql",
      "include": "**/*.sql",
      "emitTemplate": emitTemplateTarget
    },
    {
      "mode": "ts",
      "include": "**/*.ts",
      "emitTemplate": emitTemplateTarget
    }
  ],
  "srcDir": "packages/server/postgres/queries/src",
  "camelCaseColumnNames": false,
  "db": {
    "dbName": process.env.POSTGRES_DB,
    "user": process.env.POSTGRES_USER,
    "password": process.env.POSTGRES_PASSWORD,
    "host": process.env.POSTGRES_HOST,
    "port": Number(process.env.POSTGRES_PORT),
  }
}

module.exports = pgtypedConfig
