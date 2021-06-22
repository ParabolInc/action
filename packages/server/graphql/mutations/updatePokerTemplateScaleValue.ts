import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import TemplateScaleInput from '../types/TemplateScaleInput'
import UpdatePokerTemplateScaleValuePayload from '../types/UpdatePokerTemplateScaleValuePayload'
import {
  validateColorValue,
  validateScaleLabel,
  validateScaleLabelValueUniqueness
} from './helpers/validateScaleValue'
import isSpecialPokerLabel from 'parabol-client/utils/isSpecialPokerLabel'

const updatePokerTemplateScaleValue = {
  description: 'Update the label, numerical value or color of a scale value in a scale',
  type: new GraphQLNonNull(UpdatePokerTemplateScaleValuePayload),
  args: {
    scaleId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    oldScaleValue: {
      type: new GraphQLNonNull(TemplateScaleInput)
    },
    newScaleValue: {
      type: new GraphQLNonNull(TemplateScaleInput)
    }
  },
  async resolve(
    _source,
    {scaleId, oldScaleValue, newScaleValue},
    {authToken, dataLoader, socketId: mutatorId}
  ) {
    const r = await getRethink()
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const viewerId = getUserId(authToken)

    // AUTH
    const existingScale = await r.table('TemplateScale').get(scaleId).run()
    if (!existingScale || existingScale.removedAt) {
      return standardError(new Error('Did not find an active scale'), {userId: viewerId})
    }
    if (!isTeamMember(authToken, existingScale.teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // VALIDATION
    const {label: oldScaleLabel} = oldScaleValue
    const {label: newScaleLabel} = newScaleValue
    if (isSpecialPokerLabel(oldScaleLabel) && oldScaleLabel !== newScaleLabel) {
      return {error: {message: 'Cannot change the label for a special scale value'}}
    }

    const {values: oldScaleValues} = existingScale
    const oldScaleValueIndex = oldScaleValues.findIndex(
      (scaleValue) => scaleValue.label === oldScaleLabel
    )
    if (oldScaleValueIndex === -1) {
      return standardError(new Error('Did not find an existing scale value to update'), {
        userId: viewerId
      })
    }

    const {color, label} = newScaleValue
    if (!validateColorValue(color)) {
      return standardError(new Error('Invalid scale color'), {userId: viewerId})
    }
    if (!isSpecialPokerLabel(label) && !validateScaleLabel(label)) {
      return standardError(new Error('Invalid scale label'), {userId: viewerId})
    }

    await r
      .table('TemplateScale')
      .get(scaleId)
      .update((row) => ({
        values: row('values').changeAt(oldScaleValueIndex, newScaleValue),
        updatedAt: now
      }))
      .run()
    const updatedScale = await r.table('TemplateScale').get(scaleId).run()

    if (!validateScaleLabelValueUniqueness(updatedScale.values)) {
      // updated values or labels are not unique, rolling back
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
      'UpdatePokerTemplateScaleValuePayload',
      data,
      subOptions
    )
    return data
  }
}

export default updatePokerTemplateScaleValue
