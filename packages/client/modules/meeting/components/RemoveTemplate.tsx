import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import DetailAction from '../../../components/DetailAction'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import RemoveReflectTemplateMutation from '../../../mutations/RemoveReflectTemplateMutation'
import {RemoveTemplate_teamTemplates} from '../../../__generated__/RemoveTemplate_teamTemplates.graphql'
import {MeetingTypeEnum} from '~/types/graphql'
import {SprintPokerDefaults} from '../../../types/constEnums'
import RemovePokerTemplateMutation from '../../../mutations/RemovePokerTemplateMutation'
import {setActiveTemplate} from '../../../utils/relay/setActiveTemplate'

interface Props {
  gotoPublicTemplates: () => void
  teamTemplates: RemoveTemplate_teamTemplates
  templateId: string
  teamId: string
  type: string
}

const RemoveTemplate = (props: Props) => {
  const {
    gotoPublicTemplates,
    templateId,
    teamId,
    teamTemplates,
    type
  } = props
  const atmosphere = useAtmosphere()
  const {onError, onCompleted, submitting, submitMutation} = useMutationProps()

  const removeTemplate = () => {
    if (submitting) return
    submitMutation()
    const templateIds = teamTemplates.map(({id}) => id)
    const templateIdx = templateIds.indexOf(templateId)
    templateIds.splice(templateIdx, 1)
    // use the same index as the previous item. if the item was last in the list, grab the new last
    const nextTemplateId = templateIds[templateIdx] || templateIds[templateIds.length - 1]
    const meetingType = type === MeetingTypeEnum.retrospective ? MeetingTypeEnum.retrospective : MeetingTypeEnum.poker
    if (nextTemplateId) {
      setActiveTemplate(atmosphere, teamId, nextTemplateId, meetingType)
    } else {
      const defaultTemplateId = meetingType === MeetingTypeEnum.retrospective ? 'workingStuckTemplate' : SprintPokerDefaults.DEFAULT_TEMPLATE_ID
      setActiveTemplate(atmosphere, teamId, defaultTemplateId, meetingType)
      gotoPublicTemplates()
    }
    meetingType === MeetingTypeEnum.retrospective ?
      RemoveReflectTemplateMutation(atmosphere, {templateId}, {onError, onCompleted}) :
      RemovePokerTemplateMutation(atmosphere, {templateId}, {onError, onCompleted})
  }

  return <DetailAction icon={'delete'} tooltip={'Delete template'} onClick={removeTemplate} />
}
export default createFragmentContainer(
  RemoveTemplate,
  {
    teamTemplates: graphql`
      fragment RemoveTemplate_teamTemplates on MeetingTemplate @relay(plural: true) {
        id
        type
      }`
  }
)
