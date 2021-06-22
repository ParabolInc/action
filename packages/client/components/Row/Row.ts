import styled from '@emotion/styled'
import {PALETTE} from '../../styles/paletteV3'
import {Layout} from '../../types/constEnums'

const Row = styled('div')({
  alignItems: 'center',
  borderTop: `1px solid ${PALETTE.SLATE_300}`,
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  padding: Layout.ROW_GUTTER,
  width: '100%'
})

export default Row
