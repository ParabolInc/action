import PropTypes from 'prop-types'
import React from 'react'
import styled from 'react-emotion'
import withHotkey from 'react-hotkey-hoc'
import FlatButton from 'universal/components/FlatButton'
import IconLabel from 'universal/components/IconLabel'
import BounceBlock from 'universal/components/BounceBlock/BounceBlock'

const ButtonBlock = styled('div')({
  display: 'flex'
})

const CheckInControls = (props) => {
  const {
    bindHotkey,
    checkInPressFactory,
    currentMemberName,
    localPhaseItem,
    nextMemberName,
    nextPhaseName
  } = props

  const handleOnClickPresent = checkInPressFactory(true)
  const handleOnClickAbsent = checkInPressFactory(false)

  bindHotkey('h', handleOnClickPresent)
  bindHotkey('n', handleOnClickAbsent)

  const nextLabel = (
    <span>
      {`${currentMemberName} is `}
      <u>{'h'}</u>
      {'ere – '}
      {nextMemberName ? `Move to ${nextMemberName}` : `move to ${nextPhaseName}`}
    </span>
  )

  const skipLabel = (
    <span>
      {`${currentMemberName} is `}
      <u>{'n'}</u>
      {'ot here – '}
      {nextMemberName ? `Skip to ${nextMemberName}` : `skip to ${nextPhaseName}`}
    </span>
  )

  // TODO: theme-able? (button colors)

  return (
    <ButtonBlock>
      <BounceBlock animationDelay='30s' key={`checkIn${localPhaseItem}buttonAnimation`}>
        <FlatButton
          aria-label={`Mark ${currentMemberName} as “here” and move on`}
          buttonSize='medium'
          key={`checkIn${localPhaseItem}nextButton`}
          onClick={handleOnClickPresent}
        >
          <IconLabel icon='check-circle' iconColor='green' iconLarge label={nextLabel} />
        </FlatButton>
      </BounceBlock>
      <FlatButton
        aria-label={`Mark ${currentMemberName} as “not here” and move on`}
        buttonSize='medium'
        key={`checkIn${localPhaseItem}skipButton`}
        onClick={handleOnClickAbsent}
      >
        <IconLabel icon='minus-circle' iconLarge iconColor='red' label={skipLabel} />
      </FlatButton>
    </ButtonBlock>
  )
}

CheckInControls.propTypes = {
  bindHotkey: PropTypes.func.isRequired,
  checkInPressFactory: PropTypes.func.isRequired,
  currentMemberName: PropTypes.string,
  localPhaseItem: PropTypes.any.isRequired,
  nextMemberName: PropTypes.string,
  nextPhaseName: PropTypes.string
}

export default withHotkey(CheckInControls)
