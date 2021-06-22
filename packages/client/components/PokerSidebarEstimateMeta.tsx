import styled from '@emotion/styled'
import React from 'react'
import {MenuPosition} from '../hooks/useCoords'
import useTooltip from '../hooks/useTooltip'
import {PALETTE} from '../styles/paletteV3'
import {BezierCurve} from '../types/constEnums'

const EstimateMeta = styled('div')({
  fontWeight: 600,
  paddingRight: 8,
})

const EmptyProgressBar = styled('div')({
  background: PALETTE.SLATE_400,
  borderRadius: 10,
  height: 4
})

const FilledProgressBar = styled(EmptyProgressBar)<{percent: number}>(({percent}) => ({
  position: 'absolute',
  background: PALETTE.JADE_400,
  width: 24 * percent,
  top: 0,
  transition: `width 300ms ${BezierCurve.DECELERATE}`
}))

const ProgressBar = styled('div')({
  marginRight: 8,
  position: 'relative',
  width: 24
})
interface Props {
  finalScores: (string | null)[]
}

const PokerSidebarEstimateMeta = (props: Props) => {
  const {finalScores} = props
  const completedScoreCount = finalScores.filter(Boolean).length
  const {tooltipPortal, openTooltip, closeTooltip, originRef} = useTooltip<HTMLDivElement>(
    MenuPosition.LOWER_CENTER, {disabled: completedScoreCount === 0})
  if (finalScores.length === 1) {
    const [firstScore] = finalScores
    const label = firstScore || '–'
    return (
      <EstimateMeta>
        {label}
      </EstimateMeta>
    )
  }

  const tooltipBody = finalScores.map((score) => score === null ? '?' : score).join(' / ')
  return (
    <ProgressBar ref={originRef} onMouseEnter={openTooltip}
      onMouseLeave={closeTooltip}>
      <EmptyProgressBar />
      <FilledProgressBar percent={completedScoreCount / finalScores.length} />
      {tooltipPortal(<div>{tooltipBody}</div>)}
    </ProgressBar>

  )
}

export default PokerSidebarEstimateMeta
