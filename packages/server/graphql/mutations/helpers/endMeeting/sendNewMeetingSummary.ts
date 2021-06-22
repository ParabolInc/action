import getRethink from '../../../../database/rethinkDriver'
import Meeting from '../../../../database/types/Meeting'
import getMailManager from '../../../../email/getMailManager'
import newMeetingSummaryEmailCreator from '../../../../email/newMeetingSummaryEmailCreator'
import {GQLContext} from '../../../graphql'

export default async function sendNewMeetingSummary(newMeeting: Meeting, context: GQLContext) {
  const {id: meetingId, teamId, summarySentAt} = newMeeting
  if (summarySentAt) return
  const now = new Date()
  const r = await getRethink()
  const {dataLoader} = context
  const [teamMembers, team] = await Promise.all([
    dataLoader.get('teamMembersByTeamId').load(teamId),
    dataLoader.get('teams').load(teamId),
    r
      .table('NewMeeting')
      .get(meetingId)
      .update({summarySentAt: now})
      .run()
  ])
  const {name: teamName, orgId} = team
  const userIds = teamMembers.map(({userId}) => userId)
  const [content, users, organization] = await Promise.all([
    newMeetingSummaryEmailCreator({meetingId, context}),
    dataLoader.get('users').loadMany(userIds),
    dataLoader.get('organizations').load(orgId)
  ])
  const {tier, name: orgName} = organization
  const emailAddresses = users.map(({email}) => email)
  const {subject, body, html} = content
  await getMailManager().sendEmail({
    to: emailAddresses,
    subject,
    body,
    html,
    tags: ['type:meetingSummary', `tier:${tier}`, `team:${teamName}:${orgName}:${teamId}:${orgId}`]
  })
}
