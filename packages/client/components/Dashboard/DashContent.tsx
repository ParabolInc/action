import {PALETTE} from '../../styles/paletteV3'
import {Filter} from '../../types/constEnums'
import styled from '@emotion/styled'

const DashContent = styled('div')<{hasOverlay?: boolean}>(({hasOverlay}) => ({
  backgroundColor: PALETTE.SLATE_200,
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  minHeight: 0,
  // overflow: 'auto', removed because react-beautiful-dnd only supports 1 scrolling parent
  width: '100%',
  height: '100%',
  filter: hasOverlay ? Filter.BENEATH_DIALOG : undefined
}))

export default DashContent
