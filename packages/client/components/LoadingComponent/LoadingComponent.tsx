import React, {forwardRef, useEffect} from 'react'
import styled from '@emotion/styled'
import {LoadingDelayRef} from '../../hooks/useLoadingDelay'
import Spinner from '../../modules/spinner/components/Spinner/Spinner'
import {PALETTE} from '../../styles/paletteV3'
import {LoaderSize, Times} from '../../types/constEnums'
import useTimeout from '../../hooks/useTimeout'

interface WrapperProps {
  height?: string | number
  width?: string | number
}

const LoadingWrapper = styled('div')<WrapperProps>(
  ({height = 'fill-available', width = 'fill-available'}) => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height,
    width
  })
)

interface Props {
  delay?: number
  height?: number | string
  width?: number | string
  loadingDelayRef?: LoadingDelayRef
  showAfter?: number
  spinnerSize?: number
}

// the ref isn't currenty used, but the Menu component likes to pass along a ref to figure out if the child is an item
const LoadingComponent = forwardRef((props: Props, ref: any) => {
  const {
    delay,
    height,
    loadingDelayRef,
    width,
    spinnerSize = LoaderSize.MAIN,
    showAfter = Times.HUMAN_ADDICTION_THRESH
  } = props
  const minDelay = useTimeout(showAfter)
  const timedOut = useTimeout(Times.MAX_WAIT_TIME)
  useEffect(() => {
    if (loadingDelayRef) {
      loadingDelayRef.current.start = Date.now()
    }
    const loadingDelay = loadingDelayRef && loadingDelayRef.current
    return () => {
      if (loadingDelay) {
        loadingDelay.stop = Date.now()
        loadingDelay.forceUpdate()
      }
    }
  }, [loadingDelayRef])
  if (showAfter && !minDelay) return null
  return (
    <LoadingWrapper ref={ref} height={height} width={width}>
      <Spinner
        delay={delay}
        fill={timedOut ? PALETTE.TOMATO_500 : PALETTE.AQUA_400}
        width={spinnerSize}
      />
    </LoadingWrapper>
  )
})

export default LoadingComponent
