import IconLabel from '../IconLabel'
import React, {forwardRef, Ref} from 'react'
import styled from '@emotion/styled'
import FloatingActionButton from '../FloatingActionButton'
import {ZIndex} from '../../types/constEnums'

const StyledButton = styled(FloatingActionButton)({
  bottom: 20,
  height: 32,
  paddingLeft: 0,
  paddingRight: 0,
  position: 'absolute',
  right: 20,
  width: 32,
  zIndex: ZIndex.FAB
})

interface Props {
  onClick: () => void
  onMouseEnter: () => void
}

const HelpMenuToggle = forwardRef((props: Props, ref: Ref<HTMLButtonElement>) => {
  return (
    <StyledButton buttonName='help-menu-toggle' palette='white' {...props} ref={ref}>
      <IconLabel icon='help_outline' />
    </StyledButton>
  )
})

export default HelpMenuToggle
