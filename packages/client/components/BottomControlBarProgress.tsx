import styled from '@emotion/styled'
import React from 'react'
import {PALETTE} from '~/styles/paletteV3'
import CircularProgress from './CircularProgress'

const Progress = styled(CircularProgress)({
  position: 'absolute',
  transform: `translateY(-6px)`
})
interface Props {
  isNext: boolean
  progress: number
}

const BottomControlBarProgress = (props: Props) => {
  const {isNext, progress} = props
  return (
    <Progress radius={12} progress={progress} stroke={isNext ? PALETTE.ROSE_500 : PALETTE.JADE_400} thickness={2} />
  )
}

export default BottomControlBarProgress
