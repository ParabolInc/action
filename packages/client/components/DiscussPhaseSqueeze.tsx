import React, {useEffect} from 'react'
import useModal from '../hooks/useModal'
import CreditCardModal from '../modules/userDashboard/components/CreditCardModal/CreditCardModal'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {DiscussPhaseSqueeze_organization} from '~/__generated__/DiscussPhaseSqueeze_organization.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import WaitingForFacilitatorToPay from './WaitingForFacilitatorToPay'
import {PALETTE} from '../styles/paletteV3'
import {DiscussPhaseSqueeze_meeting} from '~/__generated__/DiscussPhaseSqueeze_meeting.graphql'

interface Props {
  meeting: DiscussPhaseSqueeze_meeting
  organization: DiscussPhaseSqueeze_organization
}

const DiscussPhaseSqueeze = (props: Props) => {
  const {organization, meeting} = props
  const {id: meetingId, facilitatorUserId, facilitator, showConversionModal} = meeting
  const {id: orgId, orgUserCount} = organization
  const {preferredName: facilitatorName} = facilitator
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const isFacilitating = viewerId === facilitatorUserId
  const {activeUserCount} = orgUserCount
  const {modalPortal, closePortal, openPortal} = useModal({
    noClose: true,
    background: PALETTE.SLATE_900_32
  })

  useEffect(() => {
    if (showConversionModal) {
      openPortal()
    } else if (!isFacilitating) {
      closePortal()
    }
  }, [showConversionModal, isFacilitating])

  if (isFacilitating) {
    return modalPortal(
      <CreditCardModal
        activeUserCount={activeUserCount}
        orgId={orgId}
        actionType={'squeeze'}
        closePortal={closePortal}
        meetingId={meetingId}
      />
    )
  }
  return modalPortal(<WaitingForFacilitatorToPay facilitatorName={facilitatorName} />)
}

export default createFragmentContainer(DiscussPhaseSqueeze, {
  organization: graphql`
    fragment DiscussPhaseSqueeze_organization on Organization {
      id
      orgUserCount {
        activeUserCount
      }
    }
  `,
  meeting: graphql`
    fragment DiscussPhaseSqueeze_meeting on RetrospectiveMeeting {
      id
      facilitatorUserId
      facilitator {
        preferredName
      }
      showConversionModal
    }
  `
})
