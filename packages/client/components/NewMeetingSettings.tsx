import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {NewMeetingSettings_selectedTeam} from '~/__generated__/NewMeetingSettings_selectedTeam.graphql'
import {MeetingTypeEnum} from '~/__generated__/NewMeeting_viewer.graphql'
import NewMeetingSettingsAction from './NewMeetingSettingsAction'
import NewMeetingSettingsPoker from './NewMeetingSettingsPoker'
import NewMeetingSettingsRetrospective from './NewMeetingSettingsRetrospective'

interface Props {
  meetingType: MeetingTypeEnum
  selectedTeam: NewMeetingSettings_selectedTeam
}

const settingsLookup = {
  action: NewMeetingSettingsAction,
  retrospective: NewMeetingSettingsRetrospective,
  poker: NewMeetingSettingsPoker
}

const NewMeetingSettings = (props: Props) => {
  const {meetingType, selectedTeam} = props
  const Settings = settingsLookup[meetingType]
  return <Settings team={selectedTeam} />
}

export default createFragmentContainer(NewMeetingSettings, {
  selectedTeam: graphql`
    fragment NewMeetingSettings_selectedTeam on Team {
      ...NewMeetingSettingsRetrospective_team
      ...NewMeetingSettingsAction_team
      ...NewMeetingSettingsPoker_team
      id
    }
  `
})
