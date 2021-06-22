import {GraphQLObjectType} from 'graphql'
import NewMeetingStage, {newMeetingStageFields} from './NewMeetingStage'
import NewMeetingTeamMemberStage, {
  newMeetingTeamMemberStageFields
} from './NewMeetingTeamMemberStage'
import {GQLContext} from '../graphql'
import {NewMeetingPhaseTypeEnum} from '../../database/types/GenericMeetingPhase'

const UpdatesStage = new GraphQLObjectType<any, GQLContext>({
  name: 'UpdatesStage',
  description: 'A stage that focuses on a single team member',
  interfaces: () => [NewMeetingStage, NewMeetingTeamMemberStage],
  isTypeOf: ({phaseType}) => (phaseType as NewMeetingPhaseTypeEnum) === 'updates',
  fields: () => ({
    ...newMeetingStageFields(),
    ...newMeetingTeamMemberStageFields()
  })
})

export default UpdatesStage
