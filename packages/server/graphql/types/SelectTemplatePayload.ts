import {GraphQLObjectType} from 'graphql'
import TeamMeetingSettings from './TeamMeetingSettings'
import StandardMutationError from './StandardMutationError'
import {GQLContext} from '../graphql'

const SelectTemplatePayload = new GraphQLObjectType<any, GQLContext>({
  name: 'SelectTemplatePayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    meetingSettings: {
      type: TeamMeetingSettings,
      resolve: ({meetingSettingsId}, _args, {dataLoader}) => {
        return meetingSettingsId ? dataLoader.get('meetingSettings').load(meetingSettingsId) : null
      }
    }
  })
})

export default SelectTemplatePayload
