import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {FormEvent, useEffect, useRef, useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import {MenuPosition} from '~/hooks/useCoords'
import useMenu from '~/hooks/useMenu'
import useMutationProps from '~/hooks/useMutationProps'
import GitHubCreateIssueMutation from '~/mutations/GitHubCreateIssueMutation'
import {PALETTE} from '~/styles/paletteV2'
import {NewGitHubIssueInput_meeting} from '~/__generated__/NewGitHubIssueInput_meeting.graphql'
import {NewGitHubIssueInput_viewer} from '~/__generated__/NewGitHubIssueInput_viewer.graphql'
import {PortalStatus} from '../hooks/usePortal'
import Checkbox from './Checkbox'
import Icon from './Icon'
import NewGitHubIssueMenu from './NewGitHubIssueMenu'
import PlainButton from './PlainButton/PlainButton'

const StyledButton = styled(PlainButton)({
  alignItems: 'center',
  backgroundColor: 'transparent',
  display: 'flex',
  height: '20px',
  justifyContent: 'flex-start',
  margin: 0,
  opacity: 1,
  ':hover, :focus': {
    backgroundColor: 'transparent'
  }
})

const StyledIcon = styled(Icon)({
  color: PALETTE.LINK_BLUE,
  fontSize: 20,
  padding: 0,
  alignContent: 'center'
})

const StyledLink = styled('a')({
  color: PALETTE.LINK_BLUE,
  display: 'block',
  fontSize: 12,
  lineHeight: '20px',
  textDecoration: 'none',
  '&:hover,:focus': {
    textDecoration: 'underline'
  }
})

const Form = styled('form')({
  display: 'flex',
  flexDirection: 'column'
})

const Item = styled('div')({
  backgroundColor: PALETTE.BACKGROUND_BLUE_MAGENTA,
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

const SearchInput = styled('input')({
  appearance: 'none',
  background: 'transparent',
  border: 'none',
  color: PALETTE.TEXT_MAIN,
  fontSize: 16,
  margin: 0,
  padding: 0,
  outline: 0,
  width: '100%'
})

interface Props {
  isEditing: boolean
  meeting: NewGitHubIssueInput_meeting
  setIsEditing: (isEditing: boolean) => void
  viewer: NewGitHubIssueInput_viewer
}

const NewGitHubIssueInput = (props: Props) => {
  const {isEditing, meeting, setIsEditing, viewer} = props
  const {id: meetingId} = meeting
  const {id: userId, team, teamMember} = viewer
  const {id: teamId} = team!
  const {suggestedIntegrations} = teamMember!
  const [newIssueText, setNewIssueText] = useState('')
  const atmosphere = useAtmosphere()
  const {onCompleted, onError} = useMutationProps()
  const {items} = suggestedIntegrations
  const suggestedIntegration = items && items[0]
  const nameWithOwner = suggestedIntegration?.nameWithOwner
  const [selectedNameWithOwner, setSelectedNameWithOwner] = useState(nameWithOwner)
  const {originRef, menuPortal, menuProps, togglePortal, portalStatus} = useMenu(
    MenuPosition.UPPER_RIGHT
  )
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (portalStatus === PortalStatus.Exited) {
      ref.current && ref.current.focus()
    }
  }, [portalStatus])

  const handleCreateNewIssue = (e: FormEvent) => {
    e.preventDefault()
    if (portalStatus !== PortalStatus.Exited || !selectedNameWithOwner) return
    setIsEditing(false)
    if (!newIssueText.length) return
    const variables = {
      nameWithOwner: selectedNameWithOwner,
      title: newIssueText,
      teamId,
      meetingId
    }
    GitHubCreateIssueMutation(atmosphere, variables, {onError, onCompleted})
    setNewIssueText('')
  }

  if (!isEditing) return null
  return (
    <>
      <Item>
        <Checkbox active />
        <Issue>
          <Form onSubmit={handleCreateNewIssue}>
            <SearchInput
              autoFocus
              onBlur={handleCreateNewIssue}
              onChange={(e) => setNewIssueText(e.target.value)}
              placeholder='New issue summary'
              ref={ref}
              type='text'
            />
          </Form>
          <StyledButton ref={originRef} onMouseDown={togglePortal}>
            <StyledLink>{selectedNameWithOwner}</StyledLink>
            <StyledIcon>expand_more</StyledIcon>
          </StyledButton>
        </Issue>
      </Item>
      {menuPortal(
        <NewGitHubIssueMenu
          handleSelectNameWithOwner={setSelectedNameWithOwner}
          menuProps={menuProps}
          suggestedIntegrations={suggestedIntegrations}
          teamId={teamId}
          userId={userId}
        />
      )}
    </>
  )
}

export default createFragmentContainer(NewGitHubIssueInput, {
  meeting: graphql`
    fragment NewGitHubIssueInput_meeting on PokerMeeting {
      id
    }
  `,
  viewer: graphql`
    fragment NewGitHubIssueInput_viewer on User {
      id
      team(teamId: $teamId) {
        id
      }
      teamMember(teamId: $teamId) {
        ... on TeamMember {
          suggestedIntegrations {
            ...NewGitHubIssueMenu_suggestedIntegrations
            items {
              ... on SuggestedIntegrationGitHub {
                id
                nameWithOwner
              }
            }
          }
        }
      }
    }
  `
})
