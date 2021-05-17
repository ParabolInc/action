import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import UpdatePokerScopeMutation from '../mutations/UpdatePokerScopeMutation'
import {PALETTE} from '../styles/paletteV3'
import {Threshold} from '../types/constEnums'
import isTempId from '../utils/relay/isTempId'
import {GitHubScopingSearchResultItem_issue} from '../__generated__/GitHubScopingSearchResultItem_issue.graphql'
import {UpdatePokerScopeMutationVariables} from '../__generated__/UpdatePokerScopeMutation.graphql'
import Checkbox from './Checkbox'
import Ellipsis from './Ellipsis/Ellipsis'

const Item = styled('div')({
  cursor: 'pointer',
  display: 'flex',
  paddingLeft: 16,
  paddingTop: 8,
  paddingBottom: 8
})

const Issue = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: 16
})

const Title = styled('div')({})

const StyledLink = styled('a')({
  color: PALETTE.SLATE_700,
  display: 'block',
  fontSize: 12,
  lineHeight: '20px',
  textDecoration: 'none',
  '&:hover,:focus': {
    textDecoration: 'underline'
  }
})

interface Props {
  meetingId: string
  usedServiceTaskIds: Set<string>
  issue: GitHubScopingSearchResultItem_issue
  persistQuery: () => void
}

const GitHubScopingSearchResultItem = (props: Props) => {
  const {issue, meetingId, persistQuery, usedServiceTaskIds} = props
  const {id: serviceTaskId, repository, title} = issue
  const url = issue.url as string
  const {nameWithOwner} = repository
  const isSelected = usedServiceTaskIds.has(serviceTaskId)
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitMutation, submitting} = useMutationProps()
  const disabled = !isSelected && usedServiceTaskIds.size >= Threshold.MAX_POKER_STORIES
  const isTemp = isTempId(serviceTaskId)
  const onClick = () => {
    if (submitting || disabled || isTemp) return
    submitMutation()
    const variables = {
      meetingId,
      updates: [
        {
          service: 'github',
          serviceTaskId,
          action: isSelected ? 'DELETE' : 'ADD'
        }
      ]
    } as UpdatePokerScopeMutationVariables
    UpdatePokerScopeMutation(atmosphere, variables, {onError, onCompleted})
    if (!isSelected) {
      // if they are adding an item, then their search criteria must be good, so persist it
      persistQuery()
    }
  }
  return (
    <Item onClick={onClick}>
      <Checkbox active={isSelected || isTemp} disabled={disabled} />
      <Issue>
        <Title>{title}</Title>
        <StyledLink href={url} rel='noopener noreferrer' target='_blank'>
          {nameWithOwner}
          {isTemp && <Ellipsis />}
        </StyledLink>
      </Issue>
    </Item>
  )
}

export default createFragmentContainer(GitHubScopingSearchResultItem, {
  issue: graphql`
    fragment GitHubScopingSearchResultItem_issue on _xGitHubIssue {
      id
      # use title instead of summary so the optimistic updater will use it for the sidebar
      title
      repository {
        nameWithOwner
      }
      url
    }
  `
})
