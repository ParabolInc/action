import {useEffect, useRef} from 'react'
import SendClientSegmentEventMutation from '../mutations/SendClientSegmentEventMutation'
import useAtmosphere from './useAtmosphere'
import {NewMeetingPhaseTypeEnum} from '~/__generated__/ActionMeeting_meeting.graphql'
import {CreditCardModalActionType} from '../modules/userDashboard/components/CreditCardModal/CreditCardModal'

type Options = {
  phase?: NewMeetingPhaseTypeEnum
  actionType?: CreditCardModalActionType
}

// certain users keep sending this non-stop. not sure why.
// include an eventId so we know if it's the component. if it's not here, then in must be in trebuchet
let eventId = 0
const useSegmentTrack = (event: string, options: Options) => {
  const initialOptionsRef = useRef(options)
  const atmosphere = useAtmosphere()
  useEffect(() => {
    SendClientSegmentEventMutation(atmosphere, event, {
      ...initialOptionsRef.current,
      eventId: ++eventId
    })
  }, [atmosphere, event, initialOptionsRef])
}

export default useSegmentTrack
