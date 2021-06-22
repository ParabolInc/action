import {GraphQLScalarType} from 'graphql'

const GraphQLFileType = new GraphQLScalarType({
  name: 'File',
  serialize: (value) => value,
  parseValue: (value) => value,
  parseLiteral: (ast) => ast
})

export default GraphQLFileType
