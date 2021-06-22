import React, {Children, ReactNode} from 'react'
import SwipeableViews from 'react-swipeable-views'
import styled from '@emotion/styled'
import {PALETTE} from '../../styles/paletteV3'

interface Props {
  activeIdx: number
  children: ReactNode
  disabled?: boolean
  setActiveIdx: (number) => void
  focusedIdx?: number
}

const containerStyle = {height: '100%'}
const innerStyle = {width: '100%', padding: '0 16px', height: '100%'}
const slideContainer = {
  padding: '0 4px'
}

const StepperDots = styled('div')({
  alignItems: 'center',
  display: 'flex',
  padding: '8px 0'
})

const StepperDot = styled('div')<{isLocal: boolean; isFocused: boolean}>(
  ({isLocal, isFocused}) => ({
    backgroundColor: isLocal
      ? PALETTE.GRAPE_700
      : isFocused
        ? PALETTE.ROSE_500
        : PALETTE.SLATE_600,
    borderRadius: '50%',
    height: 8,
    margin: '0 2px',
    opacity: isLocal ? undefined : isFocused ? undefined : 0.35,
    width: 8
  })
)

const ReflectWrapperMobile = (props: Props) => {
  const {children, activeIdx, setActiveIdx, focusedIdx, disabled} = props
  const childArr = Children.toArray(children)
  return (
    <>
      <SwipeableViews
        // ignoreNativeScroll required! repro: swipe on a stack where length === 1. caused by the delete button.
        ignoreNativeScroll
        enableMouseEvents
        disabled={disabled}
        index={activeIdx}
        onChangeIndex={(idx) => setActiveIdx(idx)}
        containerStyle={containerStyle}
        style={innerStyle}
        slideStyle={slideContainer}
      >
        {children}
      </SwipeableViews>
      <StepperDots>
        {childArr.map((_, idx) => {
          return (
            <StepperDot
              key={idx}
              isLocal={idx === activeIdx}
              isFocused={idx === focusedIdx}
              onClick={() => setActiveIdx(idx)}
            />
          )
        })}
      </StepperDots>
    </>
  )
}

export default ReflectWrapperMobile
