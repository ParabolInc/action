import styled from '@emotion/styled'
import textOverflow from '../styles/helpers/textOverflow'
import {PALETTE} from '../styles/paletteV3'

const DropdownMenuLabel = styled('div')<{isEmpty?: boolean}>(({isEmpty}) => ({
  ...textOverflow,
  borderBottom: `1px solid ${PALETTE.SLATE_300}`,
  color: PALETTE.SLATE_700,
  fontSize: 15,
  fontWeight: 600,
  lineHeight: '32px',
  marginBottom: isEmpty ? -8 : 8,
  padding: `0 16px`,
  userSelect: 'none'
}))

export default DropdownMenuLabel
