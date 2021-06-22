import {GraphQLID, GraphQLList, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel, Threshold} from 'parabol-client/types/constEnums'
import JiraServiceTaskId from '../../../client/shared/gqlIds/JiraServiceTaskId'
import getRethink from '../../database/rethinkDriver'
import EstimatePhase from '../../database/types/EstimatePhase'
import EstimateStage from '../../database/types/EstimateStage'
import MeetingPoker from '../../database/types/MeetingPoker'
import getTemplateRefById from '../../postgres/queries/getTemplateRefById'
import {getUserId, isTeamMember} from '../../utils/authorization'
import ensureJiraDimensionField from '../../utils/ensureJiraDimensionField'
import getRedis from '../../utils/getRedis'
import publish from '../../utils/publish'
import RedisLock from '../../utils/RedisLock'
import {GQLContext} from '../graphql'
import UpdatePokerScopeItemInput from '../types/UpdatePokerScopeItemInput'
import UpdatePokerScopePayload from '../types/UpdatePokerScopePayload'

const updatePokerScope = {
  type: GraphQLNonNull(UpdatePokerScopePayload),
  description: `Add or remove a task and its estimate phase from the meeting`,
  args: {
    meetingId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'the meeting with the estimate phases to modify'
    },
    updates: {
      type: GraphQLNonNull(GraphQLList(GraphQLNonNull(UpdatePokerScopeItemInput))),
      description: 'The list of items to add/remove to the estimate phase'
    }
  },
  resolve: async (
    _source,
    {meetingId, updates},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const r = await getRethink()
    const redis = getRedis()
    const viewerId = getUserId(authToken)
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    //AUTH
    const meeting = (await dataLoader.get('newMeetings').load(meetingId)) as MeetingPoker
    if (!meeting) {
      return {error: {message: `Meeting not found`}}
    }

    const {endedAt, teamId, phases, meetingType, templateRefId} = meeting
    if (endedAt) {
      return {error: {message: `Meeting already ended`}}
    }
    if (!isTeamMember(authToken, teamId)) {
      return {error: {message: `Not on team`}}
    }

    if (meetingType !== 'poker') {
      return {error: {message: 'Not a poker meeting'}}
    }

    // lock the meeting while the scope is updating
    const redisLock = new RedisLock(`meeting:${meetingId}`, 3000)
    await redisLock.lock(10000)

    // RESOLUTION
    const requiredJiraMappers = [] as {
      cloudId: string
      projectKey: string
      issueKey: string
      dimensionName: string
    }[]
    const estimatePhase = phases.find((phase) => phase.phaseType === 'ESTIMATE') as EstimatePhase
    let stages = estimatePhase.stages
    const templateRef = await getTemplateRefById(templateRefId)

    const {dimensions} = templateRef
    updates.forEach((update) => {
      const {service, serviceTaskId, action} = update

      if (action === 'ADD') {
        const stageExists = !!stages.find((stage) => stage.serviceTaskId === serviceTaskId)
        // see if it already exists. If so, do nothing.
        if (stageExists) return
        const lastSortOrder = stages[stages.length - 1]?.sortOrder ?? -1

        const newStages = dimensions.map(
          (_, idx) =>
            new EstimateStage({
              creatorUserId: viewerId,
              service,
              serviceTaskId,
              sortOrder: lastSortOrder + 1,
              durations: undefined,
              dimensionRefIdx: idx
            })
        )
        // MUTATIVE
        stages.push(...newStages)
        const {cloudId, issueKey, projectKey} = JiraServiceTaskId.split(serviceTaskId)
        const firstDimensionName = dimensions[0].name
        if (service === 'jira') {
          const existingMapper = requiredJiraMappers.find((mapper) => {
            // only attempt the first dimension. the other dimensions will default to comment
            return (
              mapper.cloudId === cloudId &&
              mapper.projectKey === projectKey &&
              mapper.dimensionName === firstDimensionName
            )
          })
          if (!existingMapper) {
            requiredJiraMappers.push({
              cloudId,
              issueKey,
              projectKey,
              dimensionName: firstDimensionName
            })
          }
        }
      } else if (action === 'DELETE') {
        const stagesToRemove = stages.filter((stage) => stage.serviceTaskId === serviceTaskId)
        if (stagesToRemove.length > 0) {
          // MUTATIVE
          stages = stages.filter((stage) => stage.serviceTaskId !== serviceTaskId)
          estimatePhase.stages = stages
          const writes = stagesToRemove.map((stage) => {
            return ['del', `pokerHover:${stage.id}`]
          })
          redis.multi(writes).exec()
        }
      }
    })

    await ensureJiraDimensionField(requiredJiraMappers, teamId, viewerId, dataLoader)
    if (stages.length > Threshold.MAX_POKER_STORIES) {
      return {error: {message: 'Story limit reached'}}
    }
    await r
      .table('NewMeeting')
      .get(meetingId)
      .update({
        phases
      })
      .run()

    await redisLock.unlock()
    const data = {meetingId}
    publish(SubscriptionChannel.MEETING, meetingId, 'UpdatePokerScopeSuccess', data, subOptions)
    return data
  }
}

export default updatePokerScope
