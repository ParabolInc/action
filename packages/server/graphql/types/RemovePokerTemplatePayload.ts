import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import PokerMeetingSettings from './PokerMeetingSettings'
import PokerTemplate from './PokerTemplate'
import StandardMutationError from './StandardMutationError'

const RemovePokerTemplatePayload = new GraphQLObjectType<any, GQLContext>({
  name: 'RemovePokerTemplatePayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    pokerTemplate: {
      type: PokerTemplate,
      resolve: ({templateId}, _args, {dataLoader}) => {
        if (!templateId) return null
        return dataLoader.get('meetingTemplates').load(templateId)
      }
    },
    pokerMeetingSettings: {
      type: PokerMeetingSettings,
      resolve: ({settingsId}, _args, {dataLoader}) => {
        if (!settingsId) return null
        return dataLoader.get('meetingSettings').load(settingsId)
      }
    }
  })
})

export default RemovePokerTemplatePayload
