import {GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {AGENDA_ITEMS} from 'parabol-client/utils/constants'
import makeUpdateAgendaItemSchema from 'parabol-client/validation/makeUpdateAgendaItemSchema'
import getRethink from '../../database/rethinkDriver'
import AgendaItemsPhase from '../../database/types/AgendaItemsPhase'
import AgendaItemsStage from '../../database/types/AgendaItemsStage'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import UpdateAgendaItemInput from '../types/UpdateAgendaItemInput'
import UpdateAgendaItemPayload from '../types/UpdateAgendaItemPayload'

export default {
  type: UpdateAgendaItemPayload,
  description: 'Update an agenda item',
  args: {
    updatedAgendaItem: {
      type: new GraphQLNonNull(UpdateAgendaItemInput),
      description: 'The updated item including an id, content, status, sortOrder'
    }
  },
  async resolve(
    _source,
    {updatedAgendaItem},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const now = new Date()
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const viewerId = getUserId(authToken)

    // AUTH
    const {id: agendaItemId} = updatedAgendaItem
    const [teamId] = agendaItemId.split('::')
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // VALIDATION
    const schema = makeUpdateAgendaItemSchema()
    const {
      errors,
      data: {id, ...doc}
    } = schema(updatedAgendaItem) as any
    if (Object.keys(errors).length) {
      return standardError(new Error('Failed input validation'), {userId: viewerId})
    }

    // RESOLUTION
    await r
      .table('AgendaItem')
      .get(id)
      .update({
        ...doc,
        updatedAt: now
      })
      .run()
    const activeMeetings = await dataLoader.get('activeMeetingsByTeamId').load(teamId)
    const actionMeeting = activeMeetings.find(
      (activeMeeting) => activeMeeting.meetingType === 'action'
    )
    const meetingId = actionMeeting?.id ?? null
    if (actionMeeting) {
      const {id: meetingId, phases} = actionMeeting
      const agendaItemPhase = phases.find(
        (phase) => phase.phaseType === AGENDA_ITEMS
      )! as AgendaItemsPhase
      const {stages} = agendaItemPhase
      const agendaItems = await dataLoader.get('agendaItemsByTeamId').load(teamId)
      const getSortOrder = (stage: AgendaItemsStage) => {
        const agendaItem = agendaItems.find((item) => item.id === stage.agendaItemId)
        return (agendaItem && agendaItem.sortOrder) || 0
      }
      stages.sort((a, b) => (getSortOrder(a) > getSortOrder(b) ? 1 : -1))
      await r
        .table('NewMeeting')
        .get(meetingId)
        .update({
          phases
        })
        .run()
    }
    const data = {agendaItemId, meetingId}
    publish(SubscriptionChannel.TEAM, teamId, 'UpdateAgendaItemPayload', data, subOptions)
    return data
  }
}
