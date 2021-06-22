import React, {forwardRef, Ref} from 'react'
import styled from '@emotion/styled'
import IconLabel from '../IconLabel'
import RaisedButton from '../RaisedButton'

const StyledButton = styled(RaisedButton)({
  border: 0,
  height: '1.5rem',
  lineHeight: '1.5rem',
  padding: 0,
  width: '1.5rem'
})

interface Props {
  label: string
  onClick: (e: React.MouseEvent) => void
  onMouseEnter?: (e: React.MouseEvent) => void
}

const AddTaskButton = forwardRef((props: Props, ref: Ref<HTMLButtonElement>) => {
  const {label, onClick, onMouseEnter} = props
  return (
    <StyledButton
      aria-label={`Add a Task set to ${label}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      palette='white'
      ref={ref}
      dataCy={`add-task-${label}`}
    >
      <IconLabel icon='add' />
    </StyledButton>
  )
})

export default AddTaskButton
