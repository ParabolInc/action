import {commitLocalUpdate} from 'react-relay'
import {MeetingTypeEnum} from '~/__generated__/NewMeeting_viewer.graphql'
import Atmosphere from '../../Atmosphere'
import {RecordSourceProxy} from 'relay-runtime'

const setActiveTemplateInRelayStore = (
  store: RecordSourceProxy,
  teamId: string,
  templateId: string | null,
  meetingType: MeetingTypeEnum
) => {
  const team = store.get(teamId)
  if (!team) return
  const meetingSettings = team.getLinkedRecord('meetingSettings', {meetingType: meetingType})
  if (!meetingSettings) return
  const activeTemplate = templateId ? store.get(templateId)! : null
  if (activeTemplate) {
    meetingSettings.setLinkedRecord(activeTemplate, 'activeTemplate')
  } else {
    meetingSettings.setValue(null, 'activeTemplate')
  }
}

const setActiveTemplate = (
  atmosphere: Atmosphere,
  teamId: string,
  templateId: string | null,
  meetingType: MeetingTypeEnum
) => {
  commitLocalUpdate(atmosphere, (store) => {
    setActiveTemplateInRelayStore(store, teamId, templateId, meetingType)
  })
}

export {setActiveTemplateInRelayStore, setActiveTemplate}
