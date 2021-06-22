import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '~/hooks/useMutationProps'
import UpdateRetroMaxVotesMutation from '~/mutations/UpdateRetroMaxVotesMutation'
import {PALETTE} from '~/styles/paletteV3'
import {MeetingSettingsThreshold} from '~/types/constEnums'
import {VoteSettingsMenu_meeting} from '~/__generated__/VoteSettingsMenu_meeting.graphql'
import {MenuProps} from '../hooks/useMenu'
import Menu from './Menu'
import StyledError from './StyledError'
import VoteStepper from './VoteSettingsStepper'

interface Props {
  menuProps: MenuProps
  meeting: VoteSettingsMenu_meeting
}

const VoteOption = styled('div')({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'space-between',
  padding: '8px 16px',
  fontWeight: 600,
  color: PALETTE.SLATE_600,
  fontSize: 14
})

const Label = styled('div')({})

const Error = styled(StyledError)({
  fontSize: 12
})

const VoteSettingsMenu = (props: Props) => {
  const {menuProps, meeting} = props
  const {id: meetingId, totalVotes, maxVotesPerGroup} = meeting
  const {error, onError, onCompleted, submitMutation} = useMutationProps()
  const atmosphere = useAtmosphere()
  const update = (totalVotes: number, maxVotesPerGroup: number) => {
    submitMutation()
    UpdateRetroMaxVotesMutation(
      atmosphere,
      {totalVotes, maxVotesPerGroup, meetingId},
      {onError, onCompleted}
    )
  }
  const decreaseTotalVotes = () => {
    const nextTotalVotes = totalVotes - 1
    if (nextTotalVotes < 1) return
    const nextMaxVotesPerGroup = Math.min(nextTotalVotes, maxVotesPerGroup)
    update(nextTotalVotes, nextMaxVotesPerGroup)
  }
  const increaseTotalVotes = () => {
    const nextTotalVotes = totalVotes + 1
    if (nextTotalVotes > MeetingSettingsThreshold.RETROSPECTIVE_TOTAL_VOTES_MAX) return
    update(nextTotalVotes, maxVotesPerGroup)
  }
  const decreaseMaxVotesPerGroup = () => {
    const nextMaxVotesPerGroup = maxVotesPerGroup - 1
    if (nextMaxVotesPerGroup < 1) return
    update(totalVotes, nextMaxVotesPerGroup)
  }
  const increaseMaxVotesPerGroup = () => {
    const nextMaxVotesPerGroup = maxVotesPerGroup + 1
    if (nextMaxVotesPerGroup > MeetingSettingsThreshold.RETROSPECTIVE_TOTAL_VOTES_MAX) return
    const nextTotalVotes = Math.max(totalVotes, nextMaxVotesPerGroup)
    update(nextTotalVotes, nextMaxVotesPerGroup)
  }

  return (
    <Menu ariaLabel='Adjust the vote count' {...menuProps}>
      <VoteOption>
        <Label>Votes per participant</Label>
        <VoteStepper
          value={totalVotes}
          increase={increaseTotalVotes}
          decrease={decreaseTotalVotes}
        />
      </VoteOption>
      {error && <Error>{error?.message}</Error>}
      <VoteOption>
        <Label>Votes per topic</Label>
        <VoteStepper
          value={maxVotesPerGroup}
          increase={increaseMaxVotesPerGroup}
          decrease={decreaseMaxVotesPerGroup}
        />
      </VoteOption>
    </Menu>
  )
}

export default createFragmentContainer(VoteSettingsMenu, {
  meeting: graphql`
    fragment VoteSettingsMenu_meeting on RetrospectiveMeeting {
      id
      totalVotes
      maxVotesPerGroup
    }
  `
})
