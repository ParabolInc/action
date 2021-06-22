import ms from 'ms'
import {useEffect, useState} from 'react'
import {readInlineData} from 'relay-runtime'
import useAtmosphere from '~/hooks/useAtmosphere'
import graphql from 'babel-plugin-relay/macro'
import useRouter from '~/hooks/useRouter'
import {useSnacksForNewMeetings_meetings} from '~/__generated__/useSnacksForNewMeetings_meetings.graphql'

const useSnacksForNewMeetings = (meetingsRef: any) => {
  const [dismissedMeetingIds] = useState(() => new Set<string>())
  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  const meetings = meetingsRef.map((meetingRef) =>
    readInlineData<useSnacksForNewMeetings_meetings>(
      graphql`
        fragment useSnacksForNewMeetings_meetings on NewMeeting @inline {
          id
          createdAt
          createdBy
          createdByUser {
            preferredName
          }
          name
        }
      `,
      meetingRef
    )
  )
  useEffect(() => {
    const {viewerId} = atmosphere
    const fiveMinsAgo = new Date(Date.now() - ms('5m'))
    const fiveSecsAgo = new Date(Date.now() - ms('5s'))
    const sortedMeetings = meetings
      .filter((meeting) => {
        if (dismissedMeetingIds.has(meeting.id)) return false
        const createdAt = new Date(meeting.createdAt)
        if (createdAt < fiveMinsAgo) return false
        if (meeting.createdBy === viewerId && createdAt > fiveSecsAgo) return false
        return true
      })
      .sort((a, b) => (new Date(a.createdAt) < new Date(b.createdAt) ? -1 : 1))
    const [snackedMeeting] = sortedMeetings
    if (!snackedMeeting) return
    const {id: meetingId, createdBy, createdByUser, name: meetingName} = snackedMeeting
    const {preferredName} = createdByUser
    const isInit = createdBy === viewerId
    const name = isInit ? 'You' : preferredName
    atmosphere.eventEmitter.emit('addSnackbar', {
      autoDismiss: 15,
      key: `newMeeting:${meetingId}`,
      message: `${name} just started ${meetingName}`,
      onDismiss: () => {
        dismissedMeetingIds.add(meetingId)
      },
      action: {
        label: 'Join Now',
        callback: () => {
          history.push(`/meet/${meetingId}`)
        }
      }
    })
  }, [meetings.length])
}

export default useSnacksForNewMeetings
