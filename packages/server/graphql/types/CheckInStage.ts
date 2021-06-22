import {GraphQLObjectType} from 'graphql'
import CheckInStageDB from '../../database/types/CheckInStage'
import {NewMeetingPhaseTypeEnum} from '../../database/types/GenericMeetingPhase'
import {GQLContext} from '../graphql'
import NewMeetingStage, {newMeetingStageFields} from './NewMeetingStage'
import NewMeetingTeamMemberStage, {
  newMeetingTeamMemberStageFields
} from './NewMeetingTeamMemberStage'

const CheckInStage = new GraphQLObjectType<CheckInStageDB, GQLContext>({
  name: 'CheckInStage',
  description: 'A stage that focuses on a single team member',
  interfaces: () => [NewMeetingStage, NewMeetingTeamMemberStage],
  isTypeOf: ({phaseType}) => (phaseType as NewMeetingPhaseTypeEnum) === 'checkin',
  fields: () =>
    ({
      ...newMeetingStageFields(),
      ...newMeetingTeamMemberStageFields()
    } as any)
})

export default CheckInStage
