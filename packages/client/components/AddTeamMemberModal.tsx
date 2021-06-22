import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '~/hooks/useMutationProps'
import {PALETTE} from '~/styles/paletteV3'
import {ICON_SIZE} from '~/styles/typographyV2'
import styled from '@emotion/styled'
import {AddTeamMemberModal_teamMembers} from '../__generated__/AddTeamMemberModal_teamMembers.graphql'
import useBreakpoint from '../hooks/useBreakpoint'
import InviteToTeamMutation from '../mutations/InviteToTeamMutation'
import parseEmailAddressList from '../utils/parseEmailAddressList'
import plural from '../utils/plural'
import AddTeamMemberModalSuccess from './AddTeamMemberModalSuccess'
import DialogContainer from './DialogContainer'
import DialogContent from './DialogContent'
import DialogTitle from './DialogTitle'
import Icon from './Icon'
import BasicTextArea from './InputField/BasicTextArea'
import MassInvitationTokenLinkRoot from './MassInvitationTokenLinkRoot'
import PrimaryButton from './PrimaryButton'

interface Props {
  closePortal: () => void
  meetingId?: string | undefined
  teamMembers: AddTeamMemberModal_teamMembers
  teamId: string
}

const INVITE_DIALOG_BREAKPOINT = 864
const INVITE_DIALOG_MEDIA_QUERY = `@media (min-width: ${INVITE_DIALOG_BREAKPOINT}px)`

const StyledDialogContainer = styled(DialogContainer)({
  width: 480,
  [INVITE_DIALOG_MEDIA_QUERY]: {
    width: 816
  }
})

const StyledDialogTitle = styled(DialogTitle)({
  [INVITE_DIALOG_MEDIA_QUERY]: {
    fontSize: 24,
    lineHeight: '32px',
    marginBottom: 8,
    paddingLeft: 32,
    paddingTop: 24
  }
})

const StyledDialogContent = styled(DialogContent)({
  [INVITE_DIALOG_MEDIA_QUERY]: {
    alignItems: 'center',
    display: 'flex',
    padding: '16px 32px 32px'
  }
})

const Fields = styled('div')({
  [INVITE_DIALOG_MEDIA_QUERY]: {
    maxWidth: 320
  }
})

const Illustration = styled('img')({
  display: 'block',
  flex: 1,
  marginLeft: 32,
  marginTop: -60,
  maxWidth: 400
})

const ButtonGroup = styled('div')({
  marginTop: '24px',
  display: 'flex',
  justifyContent: 'flex-end'
})

const StyledHeading = styled('h2')({
  alignItems: 'center',
  display: 'flex',
  fontSize: 15,
  lineHeight: '21px',
  margin: 0,
  padding: '0 0 3px'
})

const StyledTip = styled('p')({
  fontSize: 13,
  lineHeight: '16px',
  margin: 0,
  padding: '0 0 16px'
})

const ErrorWrapper = styled('div')<{isWarning: boolean}>(({isWarning}) => ({
  alignItems: 'center',
  color: isWarning ? PALETTE.GOLD_500 : PALETTE.TOMATO_500,
  display: 'flex',
  padding: 8,
  marginTop: 8,
  width: '100%'
}))

const StyledIcon = styled(Icon)<{isWarning: boolean}>(({isWarning}) => ({
  color: isWarning ? PALETTE.GOLD_500 : PALETTE.TOMATO_500,
  fontSize: ICON_SIZE.MD24,
  marginRight: 8
}))

const Label = styled('div')({
  fontSize: 14,
  fontWeight: 600
})

const IllustrationBlock = () => {
  const showIllustration = useBreakpoint(INVITE_DIALOG_BREAKPOINT)
  const imageSrc = `${__STATIC_IMAGES__}/illustrations/illus-momentum.png`
  return showIllustration ? <Illustration alt='' src={imageSrc} /> : null
}

const AddTeamMemberModal = (props: Props) => {
  const {closePortal, meetingId, teamMembers, teamId} = props
  const [pendingSuccessfulInvitations, setPendingSuccessfulInvitations] = useState([] as string[])
  const [successfulInvitations, setSuccessfulInvitations] = useState<string[] | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [rawInvitees, setRawInvitees] = useState('')
  const [invitees, setInvitees] = useState([] as string[])
  const {error, onCompleted, onError, submitMutation, submitting} = useMutationProps()
  const atmosphere = useAtmosphere()
  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isSubmitted) setIsSubmitted(false)
    const nextValue = e.target.value
    if (rawInvitees === nextValue) return
    const {parsedInvitees, invalidEmailExists} = parseEmailAddressList(nextValue)
    const allInvitees = parsedInvitees
      ? (parsedInvitees.map((invitee) => (invitee as any).address) as string[])
      : []
    const teamEmailSet = new Set(teamMembers.map(({email}) => email))
    const uniqueInvitees = Array.from(new Set(allInvitees))
    if (invalidEmailExists) {
      const lastValidEmail = uniqueInvitees[uniqueInvitees.length - 1]
      lastValidEmail
        ? onError(new Error(`Invalid email(s) after ${lastValidEmail}`))
        : onError(new Error(`Invalid email(s)`))
    } else {
      onCompleted()
    }
    const offTeamInvitees = uniqueInvitees.filter((email) => !teamEmailSet.has(email))
    const alreadyInvitedEmails = uniqueInvitees.filter((email) => teamEmailSet.has(email))

    setRawInvitees(nextValue)
    setInvitees(offTeamInvitees)
    if (!invalidEmailExists) {
      if (alreadyInvitedEmails.length === 1) {
        onError(new Error(`${alreadyInvitedEmails} is already on the team`))
      } else if (alreadyInvitedEmails.length === 2) {
        onError(
          new Error(
            `${alreadyInvitedEmails[0]} and ${alreadyInvitedEmails[1]} are already on the team`
          )
        )
      } else if (alreadyInvitedEmails.length > 2) {
        onError(
          new Error(
            `${alreadyInvitedEmails[0]} and ${alreadyInvitedEmails.length -
            1} other emails are already on the team`
          )
        )
      }
    }
  }

  const sendInvitations = () => {
    if (invitees.length === 0) return
    submitMutation()
    const handleCompleted = (res) => {
      setIsSubmitted(true)
      onCompleted()
      if (res) {
        const {inviteToTeam} = res
        if (inviteToTeam.invitees.length === invitees.length) {
          setSuccessfulInvitations(pendingSuccessfulInvitations.concat(inviteToTeam.invitees))
        } else {
          // there was a problem with at least 1 email
          const goodInvitees = invitees.filter((invitee) => inviteToTeam.invitees.includes(invitee))
          const badInvitees = invitees.filter((invitee) => !inviteToTeam.invitees.includes(invitee))

          onError(
            new Error(
              `Could not send an invitation to the above ${plural(badInvitees.length, 'email')}`
            )
          )
          setInvitees(badInvitees)
          setRawInvitees(badInvitees.join(', '))
          // store the successes in a list so the user gets a confirmation that all emails were sent
          setPendingSuccessfulInvitations(pendingSuccessfulInvitations.concat(goodInvitees))
        }
      }
    }
    InviteToTeamMutation(
      atmosphere,
      {meetingId, teamId, invitees},
      {onError, onCompleted: handleCompleted}
    )
  }

  if (successfulInvitations) {
    return (
      <AddTeamMemberModalSuccess
        closePortal={closePortal}
        successfulInvitations={successfulInvitations}
      />
    )
  }
  const title = invitees.length <= 1 ? 'Send Invitation' : `Send ${invitees.length} Invitations`
  return (
    <StyledDialogContainer>
      <StyledDialogTitle>{'Invite to Team'}</StyledDialogTitle>
      <StyledDialogContent>
        <Fields>
          <StyledHeading>{'Share this link'}</StyledHeading>
          <StyledTip>{'This link expires in 30 days.'}</StyledTip>
          <MassInvitationTokenLinkRoot meetingId={meetingId} teamId={teamId} />

          <StyledHeading>{'Or, send invites by email'}</StyledHeading>
          <StyledTip>{'Email invitations expire in 30 days.'}</StyledTip>
          <BasicTextArea
            autoFocus
            name='rawInvitees'
            onChange={onChange}
            placeholder='email@example.co, another@example.co'
            value={rawInvitees}
          />
          {error && (
            <ErrorWrapper isWarning={!isSubmitted}>
              <StyledIcon isWarning={!isSubmitted}>
                <Icon>{isSubmitted ? 'error' : 'warning'}</Icon>
              </StyledIcon>
              <Label>{error.message}</Label>
            </ErrorWrapper>
          )}
          <ButtonGroup>
            <PrimaryButton
              onClick={sendInvitations}
              disabled={invitees.length === 0}
              size='medium'
              waiting={submitting}
            >
              {title}
            </PrimaryButton>
          </ButtonGroup>
        </Fields>
        <IllustrationBlock />
      </StyledDialogContent>
    </StyledDialogContainer>
  )
}

export default createFragmentContainer(AddTeamMemberModal, {
  teamMembers: graphql`
    fragment AddTeamMemberModal_teamMembers on TeamMember @relay(plural: true) {
      email
    }
  `
})
