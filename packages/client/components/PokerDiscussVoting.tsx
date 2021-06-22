import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useMemo} from 'react'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import useSetFinalScoreError from '../hooks/useSetFinalScoreError'
import PokerSetFinalScoreMutation from '../mutations/PokerSetFinalScoreMutation'
import {PokerCards} from '../types/constEnums'
import isSpecialPokerLabel from '../utils/isSpecialPokerLabel'
import {PokerDiscussVoting_meeting} from '../__generated__/PokerDiscussVoting_meeting.graphql'
import {PokerDiscussVoting_stage} from '../__generated__/PokerDiscussVoting_stage.graphql'
import PokerDimensionValueControl from './PokerDimensionValueControl'
import PokerVotingRow from './PokerVotingRow'

const GroupedVotes = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflowY: 'auto'
})

interface Props {
  meeting: PokerDiscussVoting_meeting
  stage: PokerDiscussVoting_stage
  isInitialStageRender: boolean
}

const PokerDiscussVoting = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {submitting, submitMutation, onError, onCompleted, error} = useMutationProps()
  const {viewerId} = atmosphere
  const {meeting, stage, isInitialStageRender} = props
  const {id: meetingId, facilitatorUserId} = meeting
  const {id: stageId, finalScore, dimensionRef, scores} = stage
  const {scale} = dimensionRef
  const {values: scaleValues} = scale
  useSetFinalScoreError(stageId, error)
  const {rows, topLabel} = useMemo(() => {
    const scoreObj = {} as {[label: string]: PokerDiscussVoting_stage['scores'][0][]}
    let highScore = 0
    let topLabel = ''
    scores.forEach((score) => {
      const {label} = score
      scoreObj[label] = scoreObj[label] || []
      const len = scoreObj[label].push(score)
      if (len > highScore) {
        highScore = len
        topLabel = label
      }
    })
    const scoreLabels = Object.keys(scoreObj)
    const rows = scaleValues
      .filter((scaleValue) => scoreLabels.find((label) => label === scaleValue.label))
      .map((scaleValue) => {
        return {
          key: scaleValue.label,
          scaleValue,
          scores: scoreObj[scaleValue.label]
        }
      })
    const questionIdx = rows.findIndex((row) => row.key === PokerCards.QUESTION_CARD)
    if (questionIdx !== -1) {
      const questionRow = rows.splice(questionIdx, 1)[0]
      rows.unshift(questionRow)
    }
    const safeTopLabel = isSpecialPokerLabel(topLabel) ? PokerCards.QUESTION_CARD : topLabel
    return {rows, topLabel: safeTopLabel}
  }, [scores])

  const isFacilitator = viewerId === facilitatorUserId
  return (
    <>
      <PokerDimensionValueControl
        placeholder={isFacilitator ? topLabel : '?'}
        stage={stage}
        isFacilitator={isFacilitator}
      />
      <GroupedVotes>
        {rows.map(({scaleValue, scores, key}) => {
          const {label} = scaleValue
          const canClick = isFacilitator && !isSpecialPokerLabel(label)
          const setFinalScore = canClick
            ? () => {
                // finalScore === label isn't 100% accurate because they could change the dimensionField & could still submit new info
                if (submitting || !label || finalScore === label) return
                submitMutation()
                PokerSetFinalScoreMutation(
                  atmosphere,
                  {finalScore: label, meetingId, stageId},
                  {onError, onCompleted}
                )
              }
            : undefined
          return (
            <PokerVotingRow
              key={key}
              scaleValue={scaleValue}
              scores={scores}
              stageId={stageId}
              setFinalScore={setFinalScore}
              isInitialStageRender={isInitialStageRender}
            />
          )
        })}
      </GroupedVotes>
    </>
  )
}

export default createFragmentContainer(PokerDiscussVoting, {
  stage: graphql`
    fragment PokerDiscussVoting_stage on EstimateStage {
      ...PokerDimensionValueControl_stage
      id
      finalScore
      dimensionRef {
        scale {
          values {
            ...PokerVotingRow_scaleValue
            label
            color
          }
        }
      }
      scores {
        ...PokerVotingRow_scores
        label
      }
    }
  `,
  meeting: graphql`
    fragment PokerDiscussVoting_meeting on PokerMeeting {
      id
      facilitatorUserId
    }
  `
})
