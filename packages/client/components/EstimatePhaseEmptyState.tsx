import React from 'react'
import styled from '@emotion/styled'
import MeetingPhaseHeading from '~/modules/meeting/components/MeetingPhaseHeading/MeetingPhaseHeading'
import MeetingCopy from '~/modules/meeting/components/MeetingCopy/MeetingCopy'
import StyledLink from './StyledLink'

const StyledHeading = styled(MeetingPhaseHeading)({
  paddingBottom: '16px',
  textAlign: 'center'
})

const StyledCopy = styled(MeetingCopy)({
  margin: 0,
  padding: '12px 0',
  textAlign: 'center'
})

const Link = styled(StyledLink)({
  fontWeight: 600
})

const EmptyStateContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%'
})

interface Props {
  meetingId: string
}

const EstimatePhaseEmptyState = (props: Props) => {
  const {meetingId} = props
  return (
    <EmptyStateContainer>
      <StyledHeading>No items to estimate?</StyledHeading>
      <StyledCopy>It looks like you haven't added any items yet.</StyledCopy>
      <StyledCopy>
        Try adding them
        <Link to={`/meet/${meetingId}/scope`}>{' here.'}</Link>
      </StyledCopy>
    </EmptyStateContainer>
  )
}

export default EstimatePhaseEmptyState
