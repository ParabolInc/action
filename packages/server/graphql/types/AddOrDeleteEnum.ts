import {GraphQLEnumType} from 'graphql'

const AddOrDeleteEnum = new GraphQLEnumType({
  name: 'AddOrDeleteEnum',
  description: 'Option to add or delete',
  values: {
    ADD: {},
    DELETE: {}
  }
})

export default AddOrDeleteEnum
