import styled from '@emotion/styled'
import {Link} from 'react-router-dom'
import {PALETTE} from '../styles/paletteV3'

const StyledLink = styled(Link)({
  color: PALETTE.SKY_500,
  outline: 0,
  ':hover, :focus, :active': {
    color: PALETTE.SKY_600
  }
})

export default StyledLink
