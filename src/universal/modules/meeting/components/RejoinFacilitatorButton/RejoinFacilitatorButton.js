import PropTypes from 'prop-types'
import React from 'react'
import ui from 'universal/styles/ui'
import Button from 'universal/components/Button/Button'
import styled from 'react-emotion'

const RejoinButton = styled('div')({
  bottom: '1.25rem',
  position: 'fixed',
  right: '4.5rem',
  zIndex: ui.ziRejoinFacilitatorButton
})

const RejoinFacilitatorButton = (props) => {
  const {onClickHandler} = props
  return (
    <RejoinButton>
      <Button
        colorPalette='warm'
        depth={2}
        icon='user'
        label='Rejoin Facilitator'
        onClick={onClickHandler}
        buttonSize='small'
      />
    </RejoinButton>
  )
}

RejoinFacilitatorButton.propTypes = {
  onClickHandler: PropTypes.func
}

export default RejoinFacilitatorButton
