import styled from '@emotion/styled'
import React from 'react'
import {MenuPosition} from '~/hooks/useCoords'
import useTooltip from '~/hooks/useTooltip'
import {PALETTE} from '~/styles/paletteV3'
import Icon from '../Icon'
import PlainButton from '../PlainButton/PlainButton'
interface Props {
  color: {
    hex: string
    name: string
  }
  isAvailable: boolean
  isCurrentColor: boolean
  handleClick: (color: string) => void
}

const Border = styled('div')<{isAvailable: boolean}>(({isAvailable}) => ({
  alignItems: 'center',
  border: `2px solid ${isAvailable ? '#fff' : PALETTE.SLATE_400}`,
  borderRadius: '50%',
  display: 'flex',
  height: 40,
  justifyContent: 'center',
  margin: 2,
  width: 40
}))
const ColorItem = styled(PlainButton)<{color: string}>(({color}) => ({
  alignItems: 'center',
  justifyContent: 'center',
  display: 'flex',
  backgroundColor: color,
  border: `2px solid #fff`,
  height: 34,
  width: 34,
  borderRadius: '50%',
  position: 'relative',
  transition: 'all 0.3s'
}))

const SelectedIcon = styled(Icon)({
  color: '#fff'
})

const PaletteColor = (props: Props) => {
  const {color, isAvailable, isCurrentColor, handleClick} = props
  const {name, hex} = color
  const {tooltipPortal, openTooltip, closeTooltip, originRef} = useTooltip<HTMLButtonElement>(
    MenuPosition.UPPER_CENTER,
    {
      delay: 800
    }
  )
  return (
    <>
      <Border isAvailable={isAvailable}>
        <ColorItem
          ref={originRef}
          color={hex}
          onClick={() => handleClick(hex)}
          onMouseEnter={openTooltip}
          onMouseLeave={closeTooltip}
        >
          {isCurrentColor && <SelectedIcon>check</SelectedIcon>}
        </ColorItem>
      </Border>
      {tooltipPortal(<div>{name}</div>)}
    </>
  )
}

export default PaletteColor
