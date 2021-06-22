import styled from '@emotion/styled'
import {PALETTE} from '../styles/paletteV3'
import FlatButton from './FlatButton'

// Gray, neutral emphasis
const SecondaryButton = styled(FlatButton)({
  borderColor: PALETTE.SLATE_400,
  color: PALETTE.SLATE_700,
  fontWeight: 600
})

export default SecondaryButton
