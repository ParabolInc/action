import styled from '@emotion/styled'
import React, {forwardRef, Ref} from 'react'
import {PALETTE} from '../../styles/paletteV3'
import {Breakpoint, Card, ElementHeight, ElementWidth, Gutters} from '../../types/constEnums'

interface Props {
  idx: number
}

const PlaceholderCard = styled('div')({
  alignItems: 'center',
  border: `1px ${PALETTE.SLATE_500} dashed`,
  borderRadius: Card.BORDER_RADIUS,
  display: 'flex',
  justifyContent: 'center',
  margin: `0 0 ${Gutters.ROW_INNER_GUTTER}`,
  width: ElementWidth.REFLECTION_CARD,
  [`@media screen and (min-width: ${Breakpoint.SINGLE_REFLECTION_COLUMN}px)`]: {
    minHeight: ElementHeight.REFLECTION_CARD_MAX,
    margin: '0 0 24px' // matches Reflection Stack
  }
})

const Tip = styled('div')({
  color: PALETTE.SLATE_600,
  fontSize: 13,
  padding: 16,
  textAlign: 'center',
  userSelect: 'none'
})

const placeholders = [
  'Your anonymous reflections end up here',
  'Have fun with it, press : to add an emoji',
  'Your team activity is shown in the mini card grid below',
  'Collapse the sidebar if you need more room to work',
  'A highlighted column means your facilitator wants you to focus on that area',
  'Click the ? in the bottom bar for more tips'
]

const seed = Math.floor(Math.random() * placeholders.length)
const ReflectionStackPlaceholder = forwardRef((props: Props, ref: Ref<HTMLDivElement>) => {
  const {idx} = props
  const tip = placeholders[(seed + idx) % placeholders.length]
  return (
    <PlaceholderCard ref={ref}>
      <Tip>{tip}</Tip>
    </PlaceholderCard>
  )
})

export default ReflectionStackPlaceholder
