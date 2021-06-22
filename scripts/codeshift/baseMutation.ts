import {GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {getUserId} from '../../utils/authorization'
import publish from '../../utils/publish'
import {GQLContext} from '../graphql'

const MUTATION_NAME = {
  type: 'TYPE',
  description: ``,
  args: {
  },
  resolve: async (
    _source,
    {},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const r = await getRethink()
    const viewerId = getUserId(authToken)
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    //AUTH


    // VALIDATION


    // RESOLUTION
    const data = {}
    return data
  }
}

export default MUTATION_NAME
