import React from 'react'
import styled from '@emotion/styled'
import Icon from './Icon'
import {ZIndex} from '~/types/constEnums'
import FloatingActionButton from './FloatingActionButton'

const Button = styled(FloatingActionButton)({
  color: '#fff',
  padding: '10px 12px',
  width: '150px',
  bottom: 16,
  right: 16,
  position: 'absolute',
  zIndex: ZIndex.FAB
})

const StyledIcon = styled(Icon)({
  paddingRight: 8
})

const StyledLabel = styled('div')({
  fontSize: 16,
  fontWeight: 600
})

interface Props {
  labelText: string
  onClick: (e: React.MouseEvent) => void
}

const NewIntegrationRecordButton = (props: Props) => {
  const {labelText, onClick} = props
  return (
    <Button onClick={onClick} palette='blue'>
      <StyledIcon>{'add'}</StyledIcon>
      <StyledLabel>{labelText}</StyledLabel>
    </Button>
  )
}

export default NewIntegrationRecordButton
