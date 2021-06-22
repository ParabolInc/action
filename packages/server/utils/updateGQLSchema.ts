import {generateNamespace} from '@gql2ts/from-schema'
import {
  DEFAULT_ENUM_TYPE_BUILDER,
  DEFAULT_EXPORT_FUNCTION,
  DEFAULT_INTERFACE_BUILDER,
  DEFAULT_TYPE_BUILDER
} from '@gql2ts/language-typescript'
import fs from 'fs'
import {printSchema} from 'graphql'
import path from 'path'
import {promisify} from 'util'
import getProjectRoot from '../../../scripts/webpack/utils/getProjectRoot'
import schema from '../graphql/rootSchema'

const write = promisify(fs.writeFile)
// relative to the output file
const PROJECT_ROOT = getProjectRoot()
const schemaPath = path.join(PROJECT_ROOT, 'schema.graphql')
const typesPath = path.join(PROJECT_ROOT, 'packages/client/types/graphql.ts')

const typesOverrides = {
  generateNamespace: (_, interfaces) => `// AUTOMATICALLY GENERATED FILE - DO NOT EDIT

  // tslint:disable

  ${interfaces}

  // tslint:enable
  `,
  interfaceBuilder: (name, body) => DEFAULT_EXPORT_FUNCTION(DEFAULT_INTERFACE_BUILDER(name, body)),
  typeBuilder: (name, body) => DEFAULT_EXPORT_FUNCTION(DEFAULT_TYPE_BUILDER(name, body)),
  enumTypeBuilder: (name, values) =>
    DEFAULT_EXPORT_FUNCTION(DEFAULT_ENUM_TYPE_BUILDER(name, values))
}

const updateGQLSchema = async () => {
  const nextSchema = printSchema(schema)
  const gqlTypes = generateNamespace('GQL', nextSchema, {}, typesOverrides)
  await Promise.all([write(schemaPath, nextSchema), write(typesPath, gqlTypes)])
}

export default updateGQLSchema
