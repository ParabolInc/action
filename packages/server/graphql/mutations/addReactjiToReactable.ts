import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel, Threshold} from 'parabol-client/types/constEnums'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import getRethink from '../../database/rethinkDriver'
import {Reactable} from '../../database/types/Reactable'
import {getUserId} from '../../utils/authorization'
import emojiIds from '../../utils/emojiIds'
import getGroupedReactjis from '../../utils/getGroupedReactjis'
import publish from '../../utils/publish'
import {GQLContext} from '../graphql'
import AddReactjiToReactablePayload from '../types/AddReactjiToReactablePayload'
import getReactableType from '../types/getReactableType'
import ReactableEnum from '../types/ReactableEnum'

const tableLookup = {
  COMMENT: 'Comment',
  REFLECTION: 'RetroReflection'
} as const

const addReactjiToReactable = {
  type: GraphQLNonNull(AddReactjiToReactablePayload),
  description: `Add or remove a reactji from a reactable`,
  args: {
    reactableId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The id of the reactable'
    },
    reactableType: {
      type: GraphQLNonNull(ReactableEnum),
      description: 'the type of the'
    },
    reactji: {
      type: GraphQLNonNull(GraphQLString),
      description: 'the id of the reactji to add'
    },
    isRemove: {
      type: GraphQLBoolean,
      description: 'If true, remove the reaction, else add it'
    },
    meetingId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The id of the meeting'
    }
  },
  resolve: async (
    _source,
    {reactableId, reactableType, reactji, isRemove, meetingId},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const r = await getRethink()
    const viewerId = getUserId(authToken)
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    //AUTH
    const dbTable = tableLookup[reactableType]
    const reactable = (await r
      .table(dbTable)
      .get(reactableId)
      .run()) as Reactable
    if (!reactable) {
      return {error: {message: `Item does not exist`}}
    }
    const {reactjis} = reactable
    const verifiedType = getReactableType(reactable)
    if (verifiedType !== reactableType) {
      return {error: {message: `Unknown item`}}
    }
    const meetingMemberId = toTeamMemberId(meetingId, viewerId)
    const viewerMeetingMember = await dataLoader.get('meetingMembers').load(meetingMemberId)
    if (!viewerMeetingMember) {
      return {error: {message: `Not a member of the meeting`}}
    }

    // VALIDATION
    if (!emojiIds.includes(reactji)) {
      return {error: {message: `invalid emoji`}}
    }

    if (!isRemove) {
      const groupedReactjis = getGroupedReactjis(reactjis, viewerId, reactableId)
      const nextReactjiId = `${reactableId}:${reactji}`
      const isReactjiPresent = !!groupedReactjis.find((agg) => agg.id === nextReactjiId)
      // console.log('is present', isReactjiPresent, reactji, groupedReactjis)
      if (!isReactjiPresent && groupedReactjis.length >= Threshold.MAX_REACTJIS) {
        return {error: {message: `Reactji limit reached`}}
      }
    }

    // RESOLUTION
    const subDoc = {id: reactji, userId: viewerId}
    if (isRemove) {
      await r
        .table(dbTable)
        .get(reactableId)
        .update((row) => ({
          reactjis: row('reactjis').difference([subDoc]),
          updatedAt: now
        }))
        .run()
    } else {
      await r
        .table(dbTable)
        .get(reactableId)
        .update((row) => ({
          reactjis: r.branch(
            row('reactjis').contains(subDoc),
            row('reactjis'),
            // don't use distinct, it sorts the fields
            row('reactjis').append(subDoc)
          ),
          updatedAt: now
        }))
        .run()
    }

    const data = {reactableId, reactableType}
    if (meetingId) {
      publish(
        SubscriptionChannel.MEETING,
        meetingId,
        'AddReactjiToReactableSuccess',
        data,
        subOptions
      )
    }
    return data
  }
}

export default addReactjiToReactable
