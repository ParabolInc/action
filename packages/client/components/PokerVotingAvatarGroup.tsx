import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import usePokerAvatarOverflow from '~/hooks/userPokerAvatarOverflow'
import useTransition from '../hooks/useTransition'
import EstimateUserScoreId from '../shared/gqlIds/EstimateUserScoreId'
import {PALETTE} from '../styles/paletteV3'
import {PokerCards} from '../types/constEnums'
import isTempId from '../utils/relay/isTempId'
import {PokerVotingAvatarGroup_scores} from '../__generated__/PokerVotingAvatarGroup_scores.graphql'
import PokerVotingAvatar from './PokerVotingAvatar'
import PokerVotingOverflow from './PokerVotingOverflow'

const NoVotesHeaderLabel = styled('div')({
  color: PALETTE.SLATE_600,
  fontSize: 14,
  fontWeight: 600,
  lineHeight: '24px',
  paddingLeft: PokerCards.AVATAR_BORDER
})

const Wrapper = styled('div')({
  alignItems: 'center',
  display: 'flex',
  marginLeft: 16 - PokerCards.AVATAR_BORDER,
  position: 'relative',
  width: '100%',
  height: '100%'
})

interface Props {
  stageId: string
  isClosing?: boolean
  scores: PokerVotingAvatarGroup_scores
  isInitialStageRender: boolean
}

const PokerVotingAvatarGroup = (props: Props) => {
  const {isClosing, scores, stageId, isInitialStageRender} = props
  const rowRef = useRef<HTMLDivElement>(null)
  const maxAvatars = usePokerAvatarOverflow(rowRef) // max is 5, scores is 6
  const overflowCount = scores.length > maxAvatars ? scores.length - maxAvatars + 1 : 0
  const visibleScores = overflowCount === 0 ? scores : scores.slice(0, maxAvatars - 1)
  const visibleAvatars = visibleScores.map((score) => ({
    ...score,
    key: isTempId(score.id) ? EstimateUserScoreId.join(stageId, score.user?.id) : score.id
  }))

  if (overflowCount > 0) {
    visibleAvatars.push({id: 'overflow', key: 'overflow', overflowCount} as any)
  }

  const children = isClosing ? [] : visibleAvatars
  const transitionChildren = useTransition(children)
  return (
    <Wrapper ref={rowRef}>
      {transitionChildren.length === 0 && <NoVotesHeaderLabel>{'No Votes'}</NoVotesHeaderLabel>}
      {transitionChildren.map(({onTransitionEnd, child, status}, idx) => {
        const {user, id: childId} = child
        const overflowCount = (child as any).overflowCount
        const visibleScoreIdx = visibleScores.findIndex((score) => score.id === child.id)
        const displayIdx = visibleScoreIdx === -1 ? idx : visibleScoreIdx
        if (overflowCount)
          return (
            <PokerVotingOverflow
              key={childId}
              isInitialStageRender={isInitialStageRender}
              onTransitionEnd={onTransitionEnd}
              status={status}
              idx={displayIdx}
              overflowCount={overflowCount}
            />
          )
        return (
          <PokerVotingAvatar
            key={childId}
            isInitialStageRender={isInitialStageRender}
            user={user}
            onTransitionEnd={onTransitionEnd}
            status={status}
            idx={displayIdx}
          />
        )
      })}
    </Wrapper>
  )
}

export default createFragmentContainer(PokerVotingAvatarGroup, {
  scores: graphql`
    fragment PokerVotingAvatarGroup_scores on EstimateUserScore @relay(plural: true) {
      id
      user {
        ...PokerVotingAvatar_user
        id
      }
    }
  `
})
