import {ActionMeetingLobby_team} from '../__generated__/ActionMeetingLobby_team.graphql'
import React from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {ActionMeetingPhaseProps} from './ActionMeeting'
import ErrorBoundary from './ErrorBoundary'
import LabelHeading from './LabelHeading/LabelHeading'
import MeetingContent from './MeetingContent'
import MeetingTopBar from './MeetingTopBar'
import MeetingHelpToggle from './MenuHelpToggle'
import NewMeetingLobby from './NewMeetingLobby'
import PrimaryButton from './PrimaryButton'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import useRouter from '../hooks/useRouter'
import CopyShortLink from '../modules/meeting/components/CopyShortLink/CopyShortLink'
import MeetingCopy from '../modules/meeting/components/MeetingCopy/MeetingCopy'
import MeetingPhaseHeading from '../modules/meeting/components/MeetingPhaseHeading/MeetingPhaseHeading'
import StartNewMeetingMutation from '../mutations/StartNewMeetingMutation'
import {minWidthMediaQueries} from '../styles/breakpoints'
import {MeetingTypeEnum} from '../types/graphql'
import lazyPreload from '../utils/lazyPreload'
import makeHref from '../utils/makeHref'
import {meetingTypeToLabel, meetingTypeToSlug} from '../utils/meetings/lookups'

const ButtonGroup = styled('div')({
  display: 'flex',
  paddingTop: '2.25rem'
})

const ButtonBlock = styled('div')({
  width: '16.125rem'
})

const textAlign = {
  textAlign: 'center' as 'center',
  [minWidthMediaQueries[2]]: {
    textAlign: 'left' as 'left'
  }
}

const StyledLabel = styled(LabelHeading)({...textAlign})
const StyledHeading = styled(MeetingPhaseHeading)({...textAlign})
const StyledCopy = styled(MeetingCopy)({...textAlign})

const UrlBlock = styled('div')({
  margin: '3rem 0 0',
  display: 'inline-block',
  verticalAlign: 'middle'
})

interface Props extends ActionMeetingPhaseProps {
  team: ActionMeetingLobby_team
}

const StyledButton = styled(PrimaryButton)({
  width: '100%'
})

const meetingType = MeetingTypeEnum.action
const meetingLabel = meetingTypeToLabel[meetingType]
const meetingSlug = meetingTypeToSlug[meetingType]
const buttonLabel = `Start ${meetingLabel} Meeting`

const ActionMeetingLobbyHelpMenu = lazyPreload(() =>
  import(
    /*WebpackChunkName: ActionMeetingLobbyHelpMenu*/ './MeetingHelp/ActionMeetingLobbyHelpMenu'
  )
)

const ActionMeetingLobby = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  const {submitMutation, submitting, onError, onCompleted} = useMutationProps()
  const {avatarGroup, toggleSidebar, team} = props
  const {id: teamId, name: teamName, isMeetingSidebarCollapsed} = team
  const onStartMeetingClick = () => {
    if (submitting) return
    submitMutation()
    StartNewMeetingMutation(atmosphere, {teamId, meetingType}, {history, onError, onCompleted})
  }
  return (
    <MeetingContent>
      <MeetingTopBar
        avatarGroup={avatarGroup}
        isMeetingSidebarCollapsed={!!isMeetingSidebarCollapsed}
        toggleSidebar={toggleSidebar}
      />
      <ErrorBoundary>
        <NewMeetingLobby>
          <StyledLabel>{`${meetingLabel} Meeting Lobby`}</StyledLabel>
          <StyledHeading>{`${teamName} ${meetingLabel}`}</StyledHeading>
          <StyledCopy>
            {'The person who presses “Start Meeting” will be today’s Facilitator.'}
            <br />
            {'Everyone’s display automatically follows the Facilitator.'}
          </StyledCopy>
          <StyledCopy>
            <b>{'Today’s Facilitator'}</b>
            {`: begin the ${meetingLabel} Meeting!`}
          </StyledCopy>
          <ButtonGroup>
            <ButtonBlock>
              <StyledButton
                aria-label={buttonLabel}
                onClick={onStartMeetingClick}
                size='large'
                waiting={submitting}
              >
                {buttonLabel}
              </StyledButton>
            </ButtonBlock>
          </ButtonGroup>
          <UrlBlock>
            <CopyShortLink
              url={makeHref(`/${meetingSlug}/${teamId}`)}
              title={'Copy Meeting Link'}
              tooltip={'Copied the meeting link!'}
            />
          </UrlBlock>
          <MeetingHelpToggle menu={<ActionMeetingLobbyHelpMenu />} />
        </NewMeetingLobby>
      </ErrorBoundary>
    </MeetingContent>
  )
}

export default createFragmentContainer(ActionMeetingLobby, {
  team: graphql`
    fragment ActionMeetingLobby_team on Team {
      id
      name
      isMeetingSidebarCollapsed
    }
  `
})
