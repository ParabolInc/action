import useAtmosphere from './useAtmosphere'
import useRouter from './useRouter'
import handleHotkey from '../utils/meetings/handleHotkey'
import useHotkey from './useHotkey'
import EndCheckInMutation from '~/mutations/EndCheckInMutation'
import {MeetingTypeEnum} from '~/__generated__/NewMeeting_viewer.graphql'
import EndRetrospectiveMutation from '~/mutations/EndRetrospectiveMutation'
import EndSprintPokerMutation from '~/mutations/EndSprintPokerMutation'

const useEndMeetingHotkey = (meetingId: string, meetingType: MeetingTypeEnum) => {
  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  const endMeeting = handleHotkey(() => {
    if (meetingType === 'action') {
      EndCheckInMutation(atmosphere, {meetingId}, {history})
    } else if (meetingType === 'retrospective') {
      EndRetrospectiveMutation(atmosphere, {meetingId}, {history})
    } else if (meetingType === 'poker') {
      EndSprintPokerMutation(atmosphere, {meetingId}, {history})
    }
  })
  useHotkey('i c a n t h a c k i t', endMeeting)
}

export default useEndMeetingHotkey
