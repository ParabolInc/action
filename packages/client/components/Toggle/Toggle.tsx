import React from 'react'
import styled from '@emotion/styled'
import {PALETTE} from '../../styles/paletteV3'
import {DECELERATE} from '../../styles/animation'
import {switchShadow} from '../../styles/elevation'
import {Duration} from '../../types/constEnums'

interface Props {
  active: boolean
  disabled?: boolean
  onClick: (e: React.MouseEvent) => void
}

// https://material.io/design/components/selection-controls.html#switches
const WEB_CONTROL_MIN_BOX = 24
const TRACK_WIDTH = 34
const TRACK_HEIGHT = 14
const THUMB_SIZE = 20

const Switch = styled('div')({
  // adds height for minimal control size target for clicks
  padding: `${(WEB_CONTROL_MIN_BOX - TRACK_HEIGHT) / 2}px 1px`
})

const Track = styled('div')<{active: boolean; disabled: boolean | undefined}>(
  ({active, disabled}) => ({
    backgroundColor: active ? PALETTE.SLATE_400 : PALETTE.SLATE_500,
    borderRadius: TRACK_HEIGHT,
    color: 'white',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'block',
    height: TRACK_HEIGHT,
    minWidth: TRACK_WIDTH,
    opacity: disabled ? 0.38 : 1,
    position: 'relative',
    transition: `background-color ${Duration.SELECTION_CONTROL}ms ${DECELERATE}`,
    userSelect: 'none',
    width: TRACK_WIDTH
  })
)

const Thumb = styled('div')<{active: boolean}>(({active}) => ({
  backgroundColor: active ? PALETTE.GRAPE_700 : PALETTE.WHITE,
  borderRadius: '100%',
  boxShadow: switchShadow,
  display: 'block',
  height: THUMB_SIZE,
  position: 'absolute',
  top: -((THUMB_SIZE - TRACK_HEIGHT) / 2),
  transition: `transform ${Duration.SELECTION_CONTROL}ms ${DECELERATE}`,
  transform: `translateX(${active ? TRACK_WIDTH - THUMB_SIZE + 1 : -1}px)`,
  width: THUMB_SIZE
}))

const Toggle = (props: Props) => {
  const {active, disabled, onClick} = props

  return (
    <Switch onClick={disabled ? undefined : onClick}>
      <Track active={active} disabled={disabled}>
        <Thumb active={active} />
      </Track>
    </Switch>
  )
}

export default Toggle
