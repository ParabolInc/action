import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import ms from 'ms'
import React, {useEffect} from 'react'
import {createFragmentContainer} from 'react-relay'
import useMutationProps from '~/hooks/useMutationProps'
import CreateMassInvitationMutation from '~/mutations/CreateMassInvitationMutation'
import makeMinWidthQuery from '~/utils/makeMinWidthMediaQuery'
import useAtmosphere from '../hooks/useAtmosphere'
import CopyShortLink from '../modules/meeting/components/CopyShortLink/CopyShortLink'
import {PALETTE} from '../styles/paletteV3'
import {Threshold} from '../types/constEnums'
import makeHref from '../utils/makeHref'
import {MassInvitationTokenLink_viewer} from '../__generated__/MassInvitationTokenLink_viewer.graphql'

const StyledCopyShortLink = styled(CopyShortLink)({
  borderRadius: 4,
  border: `1px dashed ${PALETTE.SKY_400}`,
  color: PALETTE.SKY_500,
  fontSize: 15,
  fontWeight: 600,
  margin: '0 0 32px',
  padding: 11,
  ':hover': {
    color: PALETTE.SKY_400
  },
  [makeMinWidthQuery(400)]: {
    // make sure the length doesn't change the width
    minWidth: 280
  }
})

interface Props {
  meetingId: string | undefined
  viewer: MassInvitationTokenLink_viewer
}

const FIVE_MINUTES = ms('5m')
const acceptableLifeLeft = Threshold.MASS_INVITATION_TOKEN_LIFESPAN - FIVE_MINUTES

const MassInvitationTokenLink = (props: Props) => {
  const {meetingId, viewer} = props
  const {team} = viewer
  const {id: teamId, massInvitation} = team!
  const atmosphere = useAtmosphere()
  const {expiration, id: token} = massInvitation!
  const tokenLifeRemaining = new Date(expiration).getTime() - Date.now()
  const isTokenValid = tokenLifeRemaining > acceptableLifeLeft
  const {onCompleted, onError, submitMutation, submitting} = useMutationProps()
  useEffect(() => {
    if (isTokenValid) return
    const doFetch = async () => {
      if (submitting) return
      submitMutation()
      CreateMassInvitationMutation(atmosphere, {meetingId, teamId}, {onError, onCompleted})
    }
    doFetch().catch()
  }, [])
  const displayToken = isTokenValid ? token : '············'
  const linkLabel = `${window.__ACTION__.prblIn}/${displayToken}`
  const url = __PRODUCTION__ ? `https://${linkLabel}` : makeHref(`/invitation-link/${token}`)
  return (
    <StyledCopyShortLink
      icon='link'
      url={url}
      label={linkLabel}
      title={'Copy invite link'}
      tooltip={'Copied! Valid for 30 days'}
    />
  )
}

export default createFragmentContainer(MassInvitationTokenLink, {
  viewer: graphql`
    fragment MassInvitationTokenLink_viewer on User {
      team(teamId: $teamId) {
        id
        massInvitation(meetingId: $meetingId) {
          id
          expiration
        }
      }
    }
  `
})
