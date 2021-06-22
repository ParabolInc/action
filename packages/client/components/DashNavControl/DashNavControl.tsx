import PropTypes from 'prop-types'
import React from 'react'
import LinkButton from '../LinkButton'
import IconLabel from '../IconLabel'
import styled from '@emotion/styled'
import {PALETTE} from '../../styles/paletteV3'

const StyledLinkButton = styled(LinkButton)({
  color: PALETTE.SLATE_600,
  fontWeight: 600,
  ':hover, :focus, :active': {
    color: PALETTE.SLATE_700
  }
})

const DashNavControl = (props) => {
  const {icon, label, onClick} = props
  return (
    <StyledLinkButton aria-label={label} onClick={onClick}>
      <IconLabel icon={icon} iconLarge label={label} />
    </StyledLinkButton>
  )
}

DashNavControl.propTypes = {
  icon: PropTypes.string,
  label: PropTypes.string,
  onClick: PropTypes.func
}

export default DashNavControl
