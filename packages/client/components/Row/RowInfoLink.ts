import styled from '@emotion/styled'
import {PALETTE} from '../../styles/paletteV3'
import RowInfoCopy from './RowInfoCopy'

const color = PALETTE.SLATE_600

const LinkComponent = RowInfoCopy.withComponent('a')

const RowInfoLink = styled(LinkComponent)({
  color,
  ':hover, :focus, :active': {
    color,
    textDecoration: 'underline'
  }
})

export default RowInfoLink
