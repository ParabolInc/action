import React, {useCallback, useRef} from 'react'
import styled from '@emotion/styled'
import {PALETTE} from '../styles/paletteV3'

interface Props {
  placeholder: string
}

const Input = styled('input')({
  appearance: 'none',
  background: 'inherit',
  border: `1px solid ${PALETTE.SLATE_400}`,
  borderRadius: 2,
  display: 'block',
  fontSize: 14,
  lineHeight: '24px',
  outline: 'none',
  padding: '3px 0 3px 39px',
  width: '100%',
  '&:focus, &:active': {
    border: `1px solid ${PALETTE.SKY_500}`,
    boxShadow: `0 0 1px 1px ${PALETTE.SKY_300}`
  }
})

interface Props {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const TaskFooterIntegrateMenuSearch = (props: Props) => {
  const {onChange, placeholder, value} = props
  const ref = useRef<HTMLInputElement>(null)
  const onBlur = useCallback(() => {
    ref.current && ref.current.focus()
  }, [])
  return (
    <Input
      autoFocus
      ref={ref}
      name='search'
      onBlur={onBlur}
      onChange={onChange}
      placeholder={placeholder}
      value={value}
    />
  )
}

export default TaskFooterIntegrateMenuSearch
