import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import StartCheckInMutation from '~/mutations/StartCheckInMutation'
import StartRetrospectiveMutation from '~/mutations/StartRetrospectiveMutation'
import {NewMeetingActions_team} from '~/__generated__/NewMeetingActions_team.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useBreakpoint from '../hooks/useBreakpoint'
import useMutationProps from '../hooks/useMutationProps'
import useRouter from '../hooks/useRouter'
import StartSprintPokerMutation from '../mutations/StartSprintPokerMutation'
import {Breakpoint} from '../types/constEnums'
import {MeetingTypeEnum} from '~/__generated__/NewMeeting_viewer.graphql'
import Icon from './Icon'
import NewMeetingActionsCurrentMeetings from './NewMeetingActionsCurrentMeetings'
import PrimaryButton from './PrimaryButton'
import StyledError from './StyledError'

const newMeetingGridMediaQuery = `@media screen and (min-width: ${Breakpoint.NEW_MEETING_GRID}px)`

const ButtonBlock = styled('div')<{isDesktop: boolean}>(({isDesktop}) => ({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  justifyContent: isDesktop ? 'flex-start' : 'flex-end',
  gridArea: 'actions',
  padding: '24px 8px',
  width: '100%',
  [newMeetingGridMediaQuery]: {
    padding: '32px 8px'
  }
}))

const StartButton = styled(PrimaryButton)({
  fontSize: 18,
  width: 320,
  maxWidth: '100%',
  [newMeetingGridMediaQuery]: {
    fontSize: 24,
    height: 64
  }
})

const ForwardIcon = styled(Icon)({
  paddingLeft: 16,
  [newMeetingGridMediaQuery]: {
    fontSize: 36 // MD 1.5x
  }
})

interface Props {
  meetingType: MeetingTypeEnum
  team: NewMeetingActions_team
}

const NewMeetingActions = (props: Props) => {
  const {team, meetingType} = props
  const {id: teamId} = team
  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  const {submitMutation, error, submitting, onError, onCompleted} = useMutationProps()
  const isDesktop = useBreakpoint(Breakpoint.NEW_MEETING_SELECTOR)
  const onStartMeetingClick = () => {
    if (submitting) return
    submitMutation()
    if (meetingType === 'poker') {
      StartSprintPokerMutation(atmosphere, {teamId}, {history, onError, onCompleted})
    } else if (meetingType === 'action') {
      StartCheckInMutation(atmosphere, {teamId}, {history, onError, onCompleted})
    } else {
      StartRetrospectiveMutation(atmosphere, {teamId}, {history, onError, onCompleted})
    }
  }

  return (
    <ButtonBlock isDesktop={isDesktop}>
      <NewMeetingActionsCurrentMeetings team={team} />
      {error && <StyledError>{error.message}</StyledError>}
      <StartButton size={'large'} onClick={onStartMeetingClick} waiting={submitting}>
        Start Meeting
        <ForwardIcon>arrow_forward</ForwardIcon>
      </StartButton>
    </ButtonBlock>
  )
}

export default createFragmentContainer(NewMeetingActions, {
  team: graphql`
    fragment NewMeetingActions_team on Team {
      ...NewMeetingActionsCurrentMeetings_team
      id
    }
  `
})
