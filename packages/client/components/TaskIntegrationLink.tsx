import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {ReactNode} from 'react'
import {createFragmentContainer} from 'react-relay'
import {PALETTE} from '../styles/paletteV3'
import {Card} from '../types/constEnums'
import {TaskIntegrationLinkIntegrationJira} from '../__generated__/TaskIntegrationLinkIntegrationJira.graphql'
import {TaskIntegrationLink_integration} from '../__generated__/TaskIntegrationLink_integration.graphql'
import JiraIssueLink from './JiraIssueLink'

const StyledLink = styled('a')({
  color: PALETTE.SLATE_700,
  display: 'block',
  fontSize: Card.FONT_SIZE,
  lineHeight: '1.25rem',
  padding: `0 ${Card.PADDING}`,
  textDecoration: 'underline',
  '&:hover,:focus': {
    textDecoration: 'underline'
  }
})

interface Props {
  integration: TaskIntegrationLink_integration | null
  dataCy: string
  className?: string
  children?: ReactNode
  showJiraLabelPrefix?: boolean
}

const TaskIntegrationLink = (props: Props) => {
  const {integration, dataCy, className, children, showJiraLabelPrefix} = props
  if (!integration) return null
  const {service} = integration
  if (service === 'jira') {
    const {
      issueKey,
      projectKey,
      cloudName
    } = (integration as unknown) as TaskIntegrationLinkIntegrationJira
    return (
      <JiraIssueLink
        dataCy={`${dataCy}-jira-issue-link`}
        issueKey={issueKey}
        projectKey={projectKey}
        cloudName={cloudName}
        className={className}
        children={children}
        showLabelPrefix={showJiraLabelPrefix}
      />
    )
  } else if (service === 'github') {
    const {nameWithOwner, issueNumber} = integration
    const href =
      nameWithOwner === 'ParabolInc/ParabolDemo'
        ? 'https://github.com/ParabolInc/parabol'
        : `https://www.github.com/${nameWithOwner}/issues/${issueNumber}`
    return (
      <StyledLink
        href={href}
        rel='noopener noreferrer'
        target='_blank'
        title={`GitHub Issue #${issueNumber} on ${nameWithOwner}`}
        className={className}
      >
        {`Issue #${issueNumber}`}
        {children}
      </StyledLink>
    )
  }
  return null
}

graphql`
  fragment TaskIntegrationLinkIntegrationJira on TaskIntegrationJira {
    issueKey
    projectKey
    cloudName
  }
`

graphql`
  fragment TaskIntegrationLinkIntegrationGitHub on TaskIntegrationGitHub {
    issueNumber
    nameWithOwner
  }
`

export default createFragmentContainer(TaskIntegrationLink, {
  integration: graphql`
    fragment TaskIntegrationLink_integration on TaskIntegration {
      service
      ...TaskIntegrationLinkIntegrationGitHub @relay(mask: false)
      ...TaskIntegrationLinkIntegrationJira @relay(mask: false)
    }
  `
})
