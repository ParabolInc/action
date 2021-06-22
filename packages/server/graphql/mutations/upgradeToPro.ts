import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import {getUserId} from '../../utils/authorization'
import publish from '../../utils/publish'
import segmentIo from '../../utils/segmentIo'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import UpgradeToProPayload from '../types/UpgradeToProPayload'
import hideConversionModal from './helpers/hideConversionModal'
import upgradeToPro from './helpers/upgradeToPro'

export default {
  type: UpgradeToProPayload,
  description: 'Upgrade an account to the paid service',
  args: {
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the org requesting the upgrade'
    },
    stripeToken: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The token that came back from stripe'
    }
  },
  async resolve(
    _source,
    {orgId, stripeToken},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    const viewerId = getUserId(authToken)

    // VALIDATION
    const {stripeSubscriptionId: startingSubId} = await r
      .table('Organization')
      .get(orgId)
      .run()

    if (startingSubId) {
      return standardError(new Error('Already a pro organization'), {userId: viewerId})
    }

    // RESOLUTION
    // if they downgrade & are re-upgrading, they'll already have a stripeId
    const viewer = await dataLoader.get('users').load(viewerId)
    const {email} = viewer
    try {
      await upgradeToPro(orgId, stripeToken, email)
    } catch (e) {
      return standardError(e.param ? new Error(e.param) : e, {userId: viewerId, tags: e})
    }

    const activeMeetings = await hideConversionModal(orgId, dataLoader)
    const meetingIds = activeMeetings.map(({id}) => id)

    await r
      .table('OrganizationUser')
      .getAll(viewerId, {index: 'userId'})
      .filter({removedAt: null, orgId})
      .update({role: 'BILLING_LEADER'})
      .run()

    const teams = await dataLoader.get('teamsByOrgId').load(orgId)
    const teamIds = teams.map(({id}) => id)
    segmentIo.track({
      userId: viewerId,
      event: 'Upgrade to Pro',
      properties: {
        orgId
      }
    })
    const data = {orgId, teamIds, meetingIds}
    publish(SubscriptionChannel.ORGANIZATION, orgId, 'UpgradeToProPayload', data, subOptions)

    teamIds.forEach((teamId) => {
      // I can't readily think of a clever way to use the data obj and filter in the resolver so I'll reduce here.
      // This is probably a smelly piece of code telling me I should be sending this per-viewerId or per-org
      const teamData = {orgId, teamIds: [teamId]}
      publish(SubscriptionChannel.TEAM, teamId, 'UpgradeToProPayload', teamData, subOptions)
    })
    return data
  }
}
