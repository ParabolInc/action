import React, {ReactNode} from 'react'
import styled from '@emotion/styled'
import {PALETTE} from '../../styles/paletteV3'
import Icon from '../Icon'
import {ICON_SIZE} from '../../styles/typographyV2'

const Content = styled('div')({
  fontSize: 13,
  lineHeight: 1.5384615385,
  position: 'relative',
  padding: '12px 16px',
  width: 272
})

const MenuClose = styled(Icon)({
  color: PALETTE.SLATE_600,
  cursor: 'pointer',
  fontSize: ICON_SIZE.MD18,
  position: 'absolute',
  right: 4,
  top: -4,
  '&:hover': {
    opacity: 0.5
  }
})

interface Props {
  children: ReactNode
  closePortal: () => void
}

const HelpMenuContent = (props: Props) => {
  const {children, closePortal} = props
  return (
    <Content>
      <MenuClose data-cy='help-menu-close' onClick={closePortal} title='Close help menu'>
        close
      </MenuClose>
      {children}
    </Content>
  )
}

export default HelpMenuContent
