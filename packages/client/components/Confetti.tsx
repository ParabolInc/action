import React from 'react'
import DOMConfetti from 'react-dom-confetti'
import {PALETTE} from '../styles/paletteV3'

// spread should hit the top left & top right of the screen assuming the start is at the centroid (req'd to look good for mobile)
const spread = 180 - (Math.atan(window.innerHeight / window.innerWidth) / Math.PI) * 180 * 2
const confettiConfig = {
  angle: 90,
  spread,
  startVelocity: 90,
  elementCount: 250,
  decay: 0.88,
  colors: [
    PALETTE.SKY_500,
    PALETTE.TOMATO_600,
    PALETTE.ROSE_500,
    PALETTE.JADE_400,
    PALETTE.GOLD_300,
    PALETTE.GRAPE_700,
    PALETTE.GRAPE_500,
    PALETTE.TOMATO_500,
    PALETTE.AQUA_400
  ]
}

interface Props {
  active: boolean
}

const Confetti = (props: Props) => {
  const {active} = props
  return <DOMConfetti active={active} config={confettiConfig as object} />
}

export default Confetti
