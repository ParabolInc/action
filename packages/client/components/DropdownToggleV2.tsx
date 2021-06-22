import React, {forwardRef, ReactNode, Ref} from 'react'
import styled from '@emotion/styled'
import Icon from './Icon'
import useMenu from '../hooks/useMenu'
import {PALETTE} from '../styles/paletteV3'
import {ICON_SIZE} from '../styles/typographyV2'

const DropdownIcon = styled(Icon)<{hasCustomIcon: boolean}>(({hasCustomIcon}) => ({
  color: PALETTE.SLATE_700,
  padding: hasCustomIcon ? 15 : 12,
  fontSize: hasCustomIcon ? ICON_SIZE.MD18 : ICON_SIZE.MD24
}))

const DropdownBlock = styled('div')<{disabled: boolean | undefined}>(({disabled}) => ({
  background: '#fff',
  border: `1px solid ${PALETTE.SLATE_400}`,
  borderRadius: '4px',
  cursor: disabled ? 'not-allowed' : 'pointer',
  display: 'flex',
  fontSize: 14,
  lineHeight: '24px',
  fontWeight: 600,
  userSelect: 'none',
  width: '100%'
}))

interface Props {
  className?: string
  disabled?: boolean
  icon?: string
  onClick: ReturnType<typeof useMenu>['togglePortal']
  onMouseEnter?: () => void
  children: ReactNode
}

const DropdownToggleV2 = forwardRef((props: Props, ref: Ref<HTMLDivElement>) => {
  const {className, children, icon, onClick, onMouseEnter, disabled} = props
  return (
    <DropdownBlock
      className={className}
      disabled={disabled}
      onMouseEnter={onMouseEnter}
      ref={ref}
      onClick={disabled ? undefined : onClick}
    >
      {children}
      {!disabled && <DropdownIcon hasCustomIcon={Boolean(icon)}>{icon || 'expand_more'}</DropdownIcon>}
    </DropdownBlock>
  )
})

export default DropdownToggleV2
