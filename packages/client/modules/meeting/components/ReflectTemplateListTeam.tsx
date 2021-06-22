import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useActiveTopTemplate from '../../../hooks/useActiveTopTemplate'
import {PALETTE} from '../../../styles/paletteV3'
import {ReflectTemplateListTeam_teamTemplates} from '../../../__generated__/ReflectTemplateListTeam_teamTemplates.graphql'
import ReflectTemplateItem from './ReflectTemplateItem'

const TemplateList = styled('ul')({
  listStyle: 'none',
  paddingLeft: 0,
  marginTop: 0
})

const Message = styled('div')({
  border: `1px dashed ${PALETTE.SLATE_400}`,
  borderRadius: 4,
  color: PALETTE.SLATE_600,
  fontSize: 14,
  fontStyle: 'italic',
  lineHeight: '20px',
  margin: 'auto 32px',
  padding: '8px 16px'
})

const StyledLink = styled('span')({
  color: PALETTE.SKY_500,
  cursor: 'pointer',
  outline: 0,
  ':hover, :focus, :active': {
    color: PALETTE.SKY_600
  }
})

interface Props {
  isActive: boolean
  activeTemplateId: string
  showPublicTemplates: () => void
  teamId: string
  teamTemplates: ReflectTemplateListTeam_teamTemplates
}

const ReflectTemplateListTeam = (props: Props) => {
  const {isActive, activeTemplateId, showPublicTemplates, teamId, teamTemplates} = props
  const edges = teamTemplates.map((t) => ({node: {id: t.id}})) as readonly {node: {id: string}}[]
  useActiveTopTemplate(edges, activeTemplateId, teamId, isActive, 'retrospective')
  if (teamTemplates.length === 0) {
    return (
      <Message>
        <span>Your custom templates will show up here. Get started with a </span>
        <StyledLink onClick={showPublicTemplates}>Public Template</StyledLink>
      </Message>
    )
  }
  return (
    <TemplateList>
      {teamTemplates.map((template) => {
        return (
          <ReflectTemplateItem
            key={template.id}
            template={template}
            isActive={template.id === activeTemplateId}
            lowestScope={'TEAM'}
            teamId={teamId}
          />
        )
      })}
    </TemplateList>
  )
}

export default createFragmentContainer(ReflectTemplateListTeam, {
  teamTemplates: graphql`
    fragment ReflectTemplateListTeam_teamTemplates on ReflectTemplate @relay(plural: true) {
      id
      ...ReflectTemplateItem_template
    }
  `
})
