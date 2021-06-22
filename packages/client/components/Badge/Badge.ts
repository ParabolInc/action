import {PALETTE} from '../../styles/paletteV3'
import styled from '@emotion/styled'

const Badge = styled('div')({
  backgroundColor: PALETTE.TOMATO_500,
  borderRadius: 16,
  boxShadow: '1px 1px 2px rgba(0, 0, 0, .5)',
  color: '#FFFFFF',
  fontSize: 12,
  fontWeight: 600,
  height: 16,
  lineHeight: '16px',
  minWidth: 16,
  padding: '0 4px',
  textAlign: 'center'
})

export default Badge
