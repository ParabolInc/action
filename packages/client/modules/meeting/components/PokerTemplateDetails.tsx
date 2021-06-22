import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import customTemplate from '../../../../../static/images/illustrations/customTemplate.svg'
import estimatedEffortTemplate from '../../../../../static/images/illustrations/estimatedEffortTemplate.svg'
import wsjfTemplate from '../../../../../static/images/illustrations/wsjfTemplate.svg'
import {PALETTE} from '../../../styles/paletteV3'
import getTemplateList from '../../../utils/getTemplateList'
import makeTemplateDescription from '../../../utils/makeTemplateDescription'
import {PokerTemplateDetails_settings} from '../../../__generated__/PokerTemplateDetails_settings.graphql'
import CloneTemplate from './CloneTemplate'
import EditableTemplateName from './EditableTemplateName'
import RemoveTemplate from './RemoveTemplate'
import TemplateSharing from './TemplateSharing'
import TemplateDimensionList from './TemplateDimensionList'
import SelectTemplate from './SelectTemplate'
import AddPokerTemplateDimension from './AddPokerTemplateDimension'
import {Threshold} from '../../../types/constEnums'
import AddPokerTemplateMutation from '../../../mutations/AddPokerTemplateMutation'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'

const TemplateHeader = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  margin: '16px 0',
  paddingLeft: 56,
  paddingRight: 16,
  width: '100%',
  flexShrink: 0
})

const DimensionEditor = styled('div')({
  alignItems: 'flex-start',
  background: '#fff',
  borderRadius: 8,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  maxWidth: 520,
  width: '100%'
})

const TemplateImg = styled('img')({
  margin: '0 auto',
  maxWidth: 360,
  maxHeight: 200,
  padding: '16px 0 0',
  width: '100%'
})

const Description = styled('div')({
  color: PALETTE.SLATE_700,
  fontSize: 14,
  lineHeight: '20px'
})

const FirstLine = styled('div')({
  alignItems: 'center',
  display: 'flex'
})

const Scrollable = styled('div')<{isActiveTemplate: boolean}>(({isActiveTemplate}) => ({
  display: 'flex',
  flexDirection: 'column',
  overflow: 'auto',
  paddingBottom: isActiveTemplate ? undefined : 56,
  width: '100%'
}))

interface Props {
  gotoTeamTemplates: () => void
  gotoPublicTemplates: () => void
  closePortal: () => void
  settings: PokerTemplateDetails_settings
}

const PokerTemplateDetails = (props: Props) => {
  const {gotoTeamTemplates, gotoPublicTemplates, closePortal, settings} = props
  const {teamTemplates, team} = settings
  const activeTemplate = settings.activeTemplate ?? settings.selectedTemplate
  const {id: templateId, name: templateName, dimensions} = activeTemplate
  const {id: teamId, orgId} = team
  const lowestScope = getTemplateList(teamId, orgId, activeTemplate)
  const isOwner = activeTemplate.teamId === teamId
  const description = makeTemplateDescription(lowestScope, activeTemplate)
  const templateCount = teamTemplates.length
  const atmosphere = useAtmosphere()
  const {onError, onCompleted, submitting, submitMutation} = useMutationProps()
  const canClone = templateCount < Threshold.MAX_POKER_TEAM_TEMPLATES
  const onClone = () => {
    if (submitting || !canClone) return
    submitMutation()
    AddPokerTemplateMutation(
      atmosphere,
      {parentTemplateId: templateId, teamId},
      {onError, onCompleted}
    )
    gotoTeamTemplates()
  }
  const defaultIllustrations = {
    estimatedEffortTemplate: estimatedEffortTemplate,
    wsjfTemplate: wsjfTemplate
  }
  const headerImg = defaultIllustrations[templateId]
    ? defaultIllustrations[templateId]
    : customTemplate
  const isActiveTemplate = activeTemplate.id === settings.selectedTemplate.id
  return (
    <DimensionEditor>
      <Scrollable isActiveTemplate={isActiveTemplate}>
        <TemplateImg src={headerImg} />
        <TemplateHeader>
          <FirstLine>
            <EditableTemplateName
              key={templateId}
              name={templateName}
              templateId={templateId}
              teamTemplates={teamTemplates}
              isOwner={isOwner}
            />
            {isOwner && (
              <RemoveTemplate
                templateId={templateId}
                teamId={teamId}
                teamTemplates={teamTemplates}
                gotoPublicTemplates={gotoPublicTemplates}
                type='poker'
              />
            )}
            {!isOwner && <CloneTemplate onClick={onClone} canClone={canClone} />}
          </FirstLine>
          <Description>{description}</Description>
        </TemplateHeader>
        <TemplateDimensionList isOwner={isOwner} dimensions={dimensions} templateId={templateId} />
        {isOwner && <AddPokerTemplateDimension templateId={templateId} dimensions={dimensions} />}
        <TemplateSharing teamId={teamId} template={activeTemplate} />
      </Scrollable>
      {!isActiveTemplate && (
        <SelectTemplate closePortal={closePortal} template={activeTemplate} teamId={teamId} />
      )}
    </DimensionEditor>
  )
}

graphql`
  fragment PokerTemplateDetailsTemplate on PokerTemplate {
    ...TemplateSharing_template
    ...getTemplateList_template
    ...makeTemplateDescription_template
    id
    name
    dimensions {
      ...TemplateDimensionList_dimensions
      ...AddPokerTemplateDimension_dimensions
    }
    teamId
  }
`
export default createFragmentContainer(PokerTemplateDetails, {
  settings: graphql`
    fragment PokerTemplateDetails_settings on PokerMeetingSettings {
      activeTemplate {
        ...PokerTemplateDetailsTemplate @relay(mask: false)
        ...SelectTemplate_template
      }
      selectedTemplate {
        ...PokerTemplateDetailsTemplate @relay(mask: false)
        ...SelectTemplate_template
      }
      teamTemplates {
        ...EditableTemplateName_teamTemplates
        ...RemoveTemplate_teamTemplates
      }
      team {
        id
        orgId
      }
    }
  `
})
