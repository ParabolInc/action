import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {PokerVotingRow_scaleValue} from '../__generated__/PokerVotingRow_scaleValue.graphql'
import {PokerVotingRow_scores} from '../__generated__/PokerVotingRow_scores.graphql'
import MiniPokerCard from './MiniPokerCard'
import PokerVotingAvatarGroup from './PokerVotingAvatarGroup'
import PokerVotingRowBase from './PokerVotingRowBase'

interface Props {
  scaleValue: PokerVotingRow_scaleValue
  stageId: string
  scores: PokerVotingRow_scores
  setFinalScore?: () => void
  isInitialStageRender: boolean
}

const PokerVotingRow = (props: Props) => {
  const {scaleValue, scores, stageId, setFinalScore, isInitialStageRender} = props
  const {label, color} = scaleValue
  return (
    <PokerVotingRowBase>
      <MiniPokerCard color={color} onClick={setFinalScore}>
        {label}
      </MiniPokerCard>
      <PokerVotingAvatarGroup
        stageId={stageId}
        scores={scores}
        isInitialStageRender={isInitialStageRender}
      />
    </PokerVotingRowBase>
  )
}

export default createFragmentContainer(PokerVotingRow, {
  scaleValue: graphql`
    fragment PokerVotingRow_scaleValue on TemplateScaleValue {
      color
      label
    }
  `,
  scores: graphql`
    fragment PokerVotingRow_scores on EstimateUserScore @relay(plural: true) {
      ...PokerVotingAvatarGroup_scores
    }
  `
})
