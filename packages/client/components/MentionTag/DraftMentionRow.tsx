import styled from '@emotion/styled'
import {PALETTE} from '../../styles/paletteV3'

const DraftMentionRow = styled('div')<{active: boolean}>(({active}) => ({
  alignItems: 'center',
  backgroundColor: active ? PALETTE.SLATE_100 : undefined,
  color: active ? PALETTE.SLATE_900 : PALETTE.SLATE_700,
  cursor: 'pointer',
  display: 'flex',
  fontSize: 15,
  height: 32,
  lineHeight: '32px',
  padding: `0 16px`,
  ':hover': {
    backgroundColor: PALETTE.SLATE_100,
    color: PALETTE.SLATE_900
  }
}))

export default DraftMentionRow
