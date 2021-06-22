import React, {forwardRef, ReactNode, Ref} from 'react'
import styled from '@emotion/styled'
import PlainButton from '../PlainButton/PlainButton'
import {PALETTE} from '../../styles/paletteV3'

interface Props {
  className?: string
  isActive?: boolean
  label?: ReactNode
  onClick: () => void
}

const TabStyle = styled(PlainButton)<{isActive: boolean; isClickable: boolean}>(
  ({isActive, isClickable}) => ({
    alignItems: 'center',
    color: isActive ? PALETTE.GRAPE_700 : PALETTE.SLATE_600,
    cursor: isClickable ? 'pointer' : 'default',
    display: 'flex',
    fontSize: 14,
    justifyContent: 'center',
    outline: 0,
    lineHeight: '1.25rem',
    padding: '12px 16px',
    userSelect: 'none'
  })
)

const Label = styled('div')({
  fontWeight: 600
})

const Tab = forwardRef((props: Props, ref: Ref<HTMLButtonElement>) => {
  const {className, isActive, label, onClick} = props
  return (
    <TabStyle
      className={className}
      isActive={!!isActive}
      isClickable={!isActive}
      onClick={onClick}
      ref={ref}
    >
      <Label>{label}</Label>
    </TabStyle>
  )
})

export default Tab
