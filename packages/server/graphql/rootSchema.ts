import {GraphQLSchema} from 'graphql'
import mutation from './rootMutation'
import query from './rootQuery'
import subscription from './rootSubscription'
import rootTypes from './rootTypes'
export default new GraphQLSchema({
  query,
  mutation,
  subscription,
  types: rootTypes
})
