import {GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import shortid from 'shortid'
import getRethink from '../../../database/rethinkDriver'
import db from '../../../db'
import {requireSU} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import AddNewFeaturePayload from '../../types/addNewFeaturePayload'
import getRedis from '../../../utils/getRedis'
import sendToSentry from '../../../utils/sendToSentry'

const addNewFeature = {
  type: AddNewFeaturePayload,
  description: 'broadcast a new feature to the entire userbase',
  args: {
    copy: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The text body of the new feature'
    },
    url: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'the permalink to the blog post'
    }
  },
  resolve: async (_source, {copy, url}, {authToken, dataLoader}) => {
    const r = await getRethink()
    const redis = getRedis()

    // AUTH
    requireSU(authToken)
    const operationId = dataLoader.share()
    const subOptions = {operationId}

    // RESOLUTION
    const newFeatureId = shortid.generate()
    const newFeature = {
      id: newFeatureId,
      copy,
      url
    }
    await Promise.all([
      r
        .table('NewFeature')
        .insert(newFeature)
        .run(),
      db.writeTable('User', {newFeatureId})
    ])

    const onlineUserIds = new Set()
    const stream = redis.scanStream({match: 'presence:*'})
    stream.on('data', (keys) => {
      if (!keys?.length) return
      for (const key of keys) {
        const userId = key.substring('presence:'.length)
        if (!onlineUserIds.has(userId)) {
          onlineUserIds.add(userId)
          publish(
            SubscriptionChannel.NOTIFICATION,
            userId,
            'AddNewFeaturePayload',
            {newFeature},
            subOptions
          )
        }
      }
    })
    await new Promise((resolve, reject) => {
      stream.on('end', resolve)
      stream.on('error', (e) => {
        sendToSentry(e)
        reject(e)
      })
    })
  }
}

export default addNewFeature
