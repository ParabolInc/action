import Atmosphere from '../../Atmosphere'

const popEndMeetingToast = (atmosphere: Atmosphere, meetingId: string) => {
  atmosphere.eventEmitter.emit('addSnackbar', {
    key: `meetingKilled:${meetingId}`,
    autoDismiss: 5,
    message: `The meeting has been terminated`
  })
}

export default popEndMeetingToast
