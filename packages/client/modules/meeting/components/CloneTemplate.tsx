import React from 'react'
import DetailAction from '../../../components/DetailAction'

interface Props {
  canClone: boolean
  onClick: () => void
}

const CloneTemplate = (props: Props) => {
  const {
    canClone,
    onClick,
  } = props
  const tooltip = canClone ? 'Clone & Edit Template' : 'Too many team templates! Remove one first'
  return (
    <DetailAction disabled={!canClone} icon={'content_copy'} tooltip={tooltip} onClick={onClick} />
  )
}
export default CloneTemplate
