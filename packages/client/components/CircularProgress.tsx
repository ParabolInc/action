import styled from '@emotion/styled'
import React from 'react'
import {BezierCurve} from '~/types/constEnums'


const SVG = styled('svg')<{radius: number}>(({radius}) => ({
  height: radius * 2,
  width: radius * 2,
}))

const Circle = styled('circle')<{circumference: number, stroke: string, strokeWidth: number}>(({circumference, stroke, strokeWidth}) => ({
  fill: 'transparent',
  stroke,
  strokeDasharray: circumference.toFixed(3),
  strokeWidth,
  transform: 'rotate(-90deg)',
  transformOrigin: '50% 50%',
  transition: `stroke-dashoffset 300ms ${BezierCurve.DECELERATE}`
}))

interface Props {
  className?: string
  radius: number
  progress: number
  stroke: string
  thickness: number
}

const CircularProgress = (props: Props) => {
  const {className, radius, progress, stroke, thickness} = props
  const normalizedRadius = radius - thickness
  const circumference = normalizedRadius * 2 * Math.PI

  return (
    <SVG radius={radius} className={className}>
      <Circle
        circumference={circumference}
        stroke={stroke}
        style={{
          strokeDashoffset: circumference - progress * circumference
        }}
        strokeWidth={thickness}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
    </SVG>
  )
}

export default CircularProgress
