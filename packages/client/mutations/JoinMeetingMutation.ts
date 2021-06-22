import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import createProxyRecord from '../utils/relay/createProxyRecord'
import toTeamMemberId from '../utils/relay/toTeamMemberId'
import {JoinMeetingMutation as TJoinMeetingMutation} from '../__generated__/JoinMeetingMutation.graphql'
import {NewMeetingPhaseTypeEnum} from '~/__generated__/ActionMeeting_meeting.graphql'
import {MeetingTypeEnum} from '~/__generated__/NewMeeting_viewer.graphql'

graphql`
  fragment JoinMeetingMutation_meeting on JoinMeetingSuccess {
    meeting {
      # probably a gross overfetch, but we can fix that later
      ...MeetingSelector_meeting
    }
  }
`

const mutation = graphql`
  mutation JoinMeetingMutation($meetingId: ID!) {
    joinMeeting(meetingId: $meetingId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...JoinMeetingMutation_meeting @relay(mask: false)
    }
  }
`

const JoinMeetingMutation: StandardMutation<TJoinMeetingMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TJoinMeetingMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {meetingId} = variables
      const {viewerId} = atmosphere
      const meeting = store.get(meetingId)
      if (!meeting) return
      const meetingType = meeting.getValue('meetingType') as MeetingTypeEnum
      const teamId = meeting.getValue('teamId') as string
      const meetingMember = createProxyRecord(store, 'MeetingMember', {
        meetingId,
        meetingType,
        teamId,
        userId: viewerId
      })
      const teamMemberId = toTeamMemberId(teamId, viewerId)
      const teamMember = store.get(teamMemberId)
      if (!teamMember) return
      const integrations = teamMember.getLinkedRecord('integrations')
      if (!integrations) {
        const tmpIntegrations = createProxyRecord(store, 'TeamMemberIntegration', {})
        teamMember.setLinkedRecord(tmpIntegrations, 'integrations')
      }
      const user = store.getRoot().getLinkedRecord('viewer')
      meetingMember.setLinkedRecord(teamMember, 'teamMember')
      meetingMember.setLinkedRecord(user, 'user')
      if (meetingType === 'retrospective') {
        meetingMember.setValue(0, 'votesRemaining')
      }
      meeting.setLinkedRecord(meetingMember, 'viewerMeetingMember')

      const phases = meeting.getLinkedRecords('phases')
      if (!phases) return
      const appendStage = (phaseType: NewMeetingPhaseTypeEnum) => {
        const phase = phases.find((phase) => phase.getValue('phaseType') === phaseType)
        if (!phase) return
        const stageLookup = {
          checkin: 'CheckInStage',
          updates: 'UpdatesStage'
        }
        const stageType = stageLookup[phaseType]
        const stage = createProxyRecord(store, stageType, {
          isComplete: false,
          isNavigable: false,
          isNavigableByFacilitator: false,
          teamMemberId,
          phaseType: 'checkin',
          readyToAdvance: []
        })
        stage.setLinkedRecord(meetingMember, 'meetingMember')
        stage.setLinkedRecord(teamMember, 'teamMember')
        const stages = phase.getLinkedRecords('stages')
        if (!stages) return
        const nextStages = [...stages, stage]
        phase.setLinkedRecords(nextStages, 'stages')
      }
      appendStage('checkin')
      appendStage('updates')
    },
    onError,
    onCompleted
  })
}

export default JoinMeetingMutation
