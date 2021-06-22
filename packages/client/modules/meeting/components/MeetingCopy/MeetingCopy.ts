import styled from '@emotion/styled'
import {minWidthMediaQueries} from '../../../../styles/breakpoints'
import {PALETTE} from '../../../../styles/paletteV3'

const MeetingCopy = styled('div')({
  color: PALETTE.SLATE_700,
  fontSize: 13,
  lineHeight: 1.5,
  margin: '24px 0',

  [minWidthMediaQueries[1]]: {
    fontSize: 15
  }
})

export default MeetingCopy
