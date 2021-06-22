import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useEffect, useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import DialogContainer from '../../../components/DialogContainer'
import useAtmosphere from '../../../hooks/useAtmosphere'
import getTemplateList from '../../../utils/getTemplateList'
import {setActiveTemplate} from '../../../utils/relay/setActiveTemplate'
import {ReflectTemplateModal_retroMeetingSettings} from '../../../__generated__/ReflectTemplateModal_retroMeetingSettings.graphql'
import ReflectTemplateDetails from './ReflectTemplateDetails'
import ReflectTemplateList from './ReflectTemplateList'

interface Props {
  closePortal: () => void
  retroMeetingSettings: ReflectTemplateModal_retroMeetingSettings
}

const StyledDialogContainer = styled(DialogContainer)({
  flexDirection: 'row',
  width: 880,
  maxHeight: 520,
  minHeight: 520
})

const SCOPES = ['TEAM', 'ORGANIZATION', 'PUBLIC']

const ReflectTemplateModal = (props: Props) => {
  const {closePortal, retroMeetingSettings} = props
  const {selectedTemplate, team} = retroMeetingSettings
  const {id: teamId, orgId} = team
  const lowestScope = getTemplateList(teamId, orgId, selectedTemplate)
  const listIdx = SCOPES.indexOf(lowestScope)
  const [activeIdx, setActiveIdx] = useState(listIdx)
  const gotoTeamTemplates = () => {
    setActiveIdx(0)
  }
  const gotoPublicTemplates = () => {
    setActiveIdx(2)
  }

  const atmosphere = useAtmosphere()
  useEffect(() => {
    setActiveTemplate(atmosphere, teamId, selectedTemplate.id, 'retrospective')
  }, [])

  return (
    <StyledDialogContainer>
      <ReflectTemplateList
        settings={retroMeetingSettings}
        activeIdx={activeIdx}
        setActiveIdx={setActiveIdx}
      />
      <ReflectTemplateDetails
        settings={retroMeetingSettings}
        gotoTeamTemplates={gotoTeamTemplates}
        gotoPublicTemplates={gotoPublicTemplates}
        closePortal={closePortal}
      />
    </StyledDialogContainer>
  )
}
export default createFragmentContainer(ReflectTemplateModal, {
  retroMeetingSettings: graphql`
    fragment ReflectTemplateModal_retroMeetingSettings on RetrospectiveMeetingSettings {
      ...ReflectTemplateList_settings
      ...ReflectTemplateDetails_settings
      team {
        id
        orgId
      }
      selectedTemplate {
        id
        ...getTemplateList_template
      }
    }
  `
})
