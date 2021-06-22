import graphql from 'babel-plugin-relay/macro'
import useEmailItemGrid from 'parabol-client/hooks/useEmailItemGrid'
import {PALETTE} from 'parabol-client/styles/paletteV3'
import {FONT_FAMILY} from 'parabol-client/styles/typographyV2'
import {RETROSPECTIVE} from 'parabol-client/utils/constants'
import {MeetingMembersWithoutTasks_meeting} from 'parabol-client/__generated__/MeetingMembersWithoutTasks_meeting.graphql'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import EmailBorderBottom from './EmailBorderBottom'
import SummaryAvatarHeader from './SummaryAvatarHeader'

const headerStyle = {
  color: PALETTE.SLATE_700,
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontSize: 18,
  fontWeight: 600,
  paddingBottom: 24,
  paddingTop: 24
}

const getHeaderText = (meetingType) => {
  switch (meetingType) {
    case RETROSPECTIVE:
      return 'No New Tasks…'
    default:
      return 'No Done or New Tasks…'
  }
}

interface Props {
  meeting: MeetingMembersWithoutTasks_meeting
}

const MeetingMembersWithoutTasks = (props: Props) => {
  const {meeting} = props
  const {meetingMembers, meetingType} = meeting
  if (meetingType === 'poker') return null
  const membersWithoutTasks = meetingMembers.filter(
    (member) =>
      ((member.tasks && member.tasks.length) || 0) +
      ((member.doneTasks && member.doneTasks.length) || 0) ===
      0
  )
  membersWithoutTasks.sort((a, b) =>
    a.user.preferredName.toLowerCase() < b.user.preferredName.toLowerCase() ? -1 : 1
  )
  const grid = useEmailItemGrid(membersWithoutTasks || [], 4)
  if (membersWithoutTasks.length === 0) return null
  return (
    <>
      <tr>
        <td align='center' style={headerStyle}>
          {getHeaderText(meetingType)}
        </td>
      </tr>
      <tr>
        <td>
          {grid((item) => (
            <SummaryAvatarHeader key={item.id} meetingMember={item} />
          ))}
        </td>
      </tr>
      <EmailBorderBottom />
    </>
  )
}

export default createFragmentContainer(MeetingMembersWithoutTasks, {
  meeting: graphql`
    fragment MeetingMembersWithoutTasks_meeting on NewMeeting {
      meetingType
      meetingMembers {
        ...SummaryAvatarHeader_meetingMember
        id
        user {
          preferredName
          rasterPicture
        }
        ... on ActionMeetingMember {
          tasks {
            id
          }
          doneTasks {
            id
          }
        }
        ... on RetrospectiveMeetingMember {
          tasks {
            id
          }
        }
      }
    }
  `
})
