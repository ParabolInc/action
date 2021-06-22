import styled from '@emotion/styled'
import React from 'react'
import {MenuPosition} from '../hooks/useCoords'
import useTooltip from '../hooks/useTooltip'
import {PALETTE} from '../styles/paletteV3'
import {ICON_SIZE} from '../styles/typographyV2'
import FlatButton from './FlatButton'
import Icon from './Icon'

const Button = styled(FlatButton)({
  alignItems: 'center',
  color: PALETTE.SLATE_600,
  height: 32,
  justifyContent: 'center',
  padding: 0,
  width: 32
})

const ActionButton = styled(Icon)({
  fontSize: ICON_SIZE.MD18
})

interface Props {
  disabled?: boolean
  onClick: React.MouseEventHandler
  tooltip: string
  icon: string
}

const DetailAction = (props: Props) => {
  const {disabled, tooltip, icon, onClick} = props
  const {tooltipPortal, openTooltip, closeTooltip, originRef} = useTooltip<HTMLButtonElement>(
    MenuPosition.UPPER_CENTER
  )
  return (
    <>
      <Button
        ref={originRef}
        onClick={disabled ? openTooltip : onClick}
        size='small'
        onMouseEnter={openTooltip}
        onMouseLeave={closeTooltip}
      >
        <ActionButton>{icon}</ActionButton>
      </Button>
      {tooltipPortal(<div>{tooltip}</div>)}
    </>
  )
}

export default DetailAction
