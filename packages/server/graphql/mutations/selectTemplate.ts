import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import MeetingTemplate from '../../database/types/MeetingTemplate'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import SelectTemplatePayload from '../types/SelectTemplatePayload'

const selectTemplate = {
  description: 'Set the selected template for the upcoming retro meeting',
  type: SelectTemplatePayload,
  args: {
    selectedTemplateId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    teamId: {
      type: GraphQLNonNull(GraphQLID)
    }
  },
  async resolve(
    _source,
    {selectedTemplateId, teamId},
    {authToken, dataLoader, socketId: mutatorId}
  ) {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const viewerId = getUserId(authToken)

    // AUTH
    const template = (await dataLoader
      .get('meetingTemplates')
      .load(selectedTemplateId)) as MeetingTemplate

    if (!template || !template.isActive) {
      console.log('no template', selectedTemplateId, template)
      return standardError(new Error('Template not found'), {userId: viewerId})
    }

    const {scope} = template
    if (scope === 'TEAM') {
      if (!isTeamMember(authToken, template.teamId))
        return standardError(new Error('Template is scoped to team'), {userId: viewerId})
    } else if (scope === 'ORGANIZATION') {
      const [viewerTeam, templateTeam] = await dataLoader
        .get('teams')
        .loadMany([teamId, template.teamId])
      if (viewerTeam.orgId !== templateTeam.orgId) {
        return standardError(new Error('Template is scoped to organization'), {userId: viewerId})
      }
    }

    // RESOLUTION
    const meetingSettingsId = await r
      .table('MeetingSettings')
      .getAll(teamId, {index: 'teamId'})
      .filter({
        meetingType: template.type
      })
      .update(
        {
          selectedTemplateId
        },
        {returnChanges: true}
      )('changes')(0)('old_val')('id')
      .default(null)
      .run()

    if (!meetingSettingsId) {
      return standardError(new Error('Template already updated'), {userId: viewerId})
    }

    const data = {meetingSettingsId}
    publish(SubscriptionChannel.TEAM, teamId, 'SelectTemplatePayload', data, subOptions)
    return data
  }
}

export default selectTemplate
