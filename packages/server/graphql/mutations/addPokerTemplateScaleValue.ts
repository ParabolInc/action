import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import AddTemplateScaleInput from '../types/AddTemplateScaleInput'
import AddPokerTemplateScaleValuePayload from '../types/AddPokerTemplateScaleValuePayload'
import {
  validateColorValue,
  validateScaleLabel,
  validateScaleLabelValueUniqueness
} from './helpers/validateScaleValue'

const addPokerTemplateScaleValue = {
  description: 'Add a new scale value for a scale in a poker template',
  type: new GraphQLNonNull(AddPokerTemplateScaleValuePayload),
  args: {
    scaleId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    scaleValue: {
      type: new GraphQLNonNull(AddTemplateScaleInput)
    }
  },
  async resolve(_source, {scaleId, scaleValue}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = await getRethink()
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const viewerId = getUserId(authToken)

    // AUTH
    const existingScale = await r
      .table('TemplateScale')
      .get(scaleId)
      .run()
    if (!existingScale || existingScale.removedAt) {
      return standardError(new Error('Did not find an active scale'), {userId: viewerId})
    }
    if (!isTeamMember(authToken, existingScale.teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // VALIDATION
    const {color, label} = scaleValue
    if (!validateColorValue(color)) {
      return standardError(new Error('Invalid scale color'), {userId: viewerId})
    }
    if (!validateScaleLabel(label)) {
      return standardError(new Error('Invalid scale label'), {userId: viewerId})
    }

    const updatedScale = await r
      .table('TemplateScale')
      .get(scaleId)
      .update(
        (row) => ({
          // Append at the end of the sub-array (minus ? and Pass)
          values: row('values').insertAt(
            row('values')
              .count()
              .sub(2),
            scaleValue
          ),
          updatedAt: now
        }),
        {returnChanges: true}
      )('changes')(0)('new_val')
      .default(null)
      .run()

    if (updatedScale && !validateScaleLabelValueUniqueness(updatedScale.values)) {
      // updated values and/or labels are not unique, rolling back
      await r
        .table('TemplateScale')
        .get(scaleId)
        .update({
          values: existingScale.values,
          updatedAt: existingScale.updatedAt
        })
        .run()
      return standardError(new Error('Scale labels and/or numerical values are not unique'), {
        userId: viewerId
      })
    }

    const data = {scaleId}
    publish(
      SubscriptionChannel.TEAM,
      existingScale.teamId,
      'AddPokerTemplateScaleValuePayload',
      data,
      subOptions
    )
    return data
  }
}

export default addPokerTemplateScaleValue
