import styled from '@emotion/styled'
import React, {ReactNode, useRef} from 'react'
import useScrollIntoView from '../hooks/useScrollIntoVIew'
import {PALETTE} from '../styles/paletteV3'
import {NavSidebar} from '../types/constEnums'

const lineHeight = NavSidebar.SUB_LINE_HEIGHT

interface ItemRootProps {
  isActive: boolean
  isComplete?: boolean
  isDisabled: boolean
  isDragging: boolean
  onClick: ((e: React.MouseEvent) => void) | undefined
  isUnsyncedFacilitatorStage: boolean
}

const ItemRoot = styled('div')<ItemRootProps>(
  ({isActive, isComplete, isDisabled, isDragging, onClick}) => ({
    alignItems: 'center',
    backgroundColor: isActive ? PALETTE.SLATE_100 : isDragging ? PALETTE.SLATE_100 : 'transparent',
    borderRadius: '0 4px 4px 0',
    color: PALETTE.SLATE_700,
    display: 'flex',
    flexShrink: 0,
    fontSize: 14,
    fontWeight: 400,
    minHeight: 40,
    opacity: !isActive && isComplete ? 0.5 : undefined,
    padding: '8px 0',
    position: 'relative',
    userSelect: 'none',
    width: '100%',
    '&:hover': {
      backgroundColor: onClick && !isActive ? PALETTE.SLATE_100 : undefined,
      cursor: !isActive && onClick ? 'pointer' : undefined,
      opacity: !isDisabled ? 1 : undefined
    }
  }),
  ({isUnsyncedFacilitatorStage}) =>
    isUnsyncedFacilitatorStage && {
      color: PALETTE.ROSE_500,
      opacity: 1
    }
)

const ItemLabel = styled('div')<{isComplete?: boolean}>(({isComplete}) => ({
  color: 'inherit',
  fontSize: NavSidebar.SUB_FONT_SIZE,
  flex: 1,
  paddingLeft: 56,
  textDecoration: isComplete ? 'line-through' : undefined,
  wordBreak: 'break-word',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'pre'
}))

const ItemMeta = styled('div')({
  alignItems: 'center',
  alignContent: 'center',
  display: 'flex',
  height: lineHeight,
  paddingLeft: 4
})

interface Props {
  isActive: boolean
  isComplete?: boolean
  isDisabled: boolean
  isDragging: boolean
  isUnsyncedFacilitatorStage: boolean
  children: ReactNode
  metaContent: any
  onClick: ((e: React.MouseEvent) => void) | undefined
}

const MeetingSubnavItem = (props: Props) => {
  const {
    isActive,
    isComplete,
    isDisabled,
    isDragging,
    isUnsyncedFacilitatorStage,
    children,
    metaContent,
    onClick
  } = props
  const ref = useRef(null)
  useScrollIntoView(ref, isActive)
  return (
    <ItemRoot
      ref={ref}
      isActive={isActive}
      isComplete={isComplete}
      isDisabled={isDisabled}
      isDragging={isDragging}
      isUnsyncedFacilitatorStage={isUnsyncedFacilitatorStage}
      onClick={!isDisabled ? onClick : undefined}
    >
      <ItemLabel isComplete={isComplete}>{children}</ItemLabel>
      <ItemMeta>{metaContent}</ItemMeta>
    </ItemRoot>
  )
}

export default MeetingSubnavItem
