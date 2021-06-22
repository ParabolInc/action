import Meeting from '../../../../database/types/Meeting'
import MeetingTemplate from '../../../../database/types/MeetingTemplate'
import MeetingMember from '../../../../database/types/MeetingMember'
import segmentIo from '../../../../utils/segmentIo'

const sendMeetingEndToSegment = async (
  completedMeeting: Meeting,
  meetingMembers: MeetingMember[],
  template?: MeetingTemplate
) => {
  const {facilitatorUserId, meetingNumber, meetingType, phases, teamId} = completedMeeting
  const presentMemberUserIds = meetingMembers.map(({userId}) => userId)
  presentMemberUserIds.forEach((userId) => {
    const wasFacilitator = userId === facilitatorUserId
    segmentIo.track({
      userId,
      event: 'Meeting Completed',
      properties: {
        hasIcebreaker: phases[0].phaseType === 'checkin',
        // include wasFacilitator as a flag to handle 1 per meeting
        wasFacilitator,
        userIds: wasFacilitator ? presentMemberUserIds : undefined,
        meetingType,
        meetingTemplateId: template?.id,
        meetingTemplateName: template?.name,
        meetingTemplateScope: template?.scope,
        meetingTemplateIsFromParabol: !!template?.isStarter,
        meetingNumber,
        teamMembersCount: meetingMembers.length,
        teamMembersPresentCount: meetingMembers.length,
        teamId
      }
    })
  })
}

export default sendMeetingEndToSegment
