import React, {ComponentType, ReactNode} from 'react'
import {TransitionGroup} from 'react-transition-group'
import AnimatedFade from '../../components/AnimatedFade'
import ErrorComponent from '../../components/ErrorComponent/ErrorComponent'
import LoadingComponent from '../../components/LoadingComponent/LoadingComponent'
import * as Sentry from '@sentry/browser'

interface Options {
  Loader?: ReactNode
  Error?: ComponentType<{error: any}>
  props?: {[key: string]: any}
  size?: number
  loadingDelay?: number
  menuLoadingWidth?: number
}

const renderQuery = (ReadyComponent: ComponentType<any>, options: Options = {}) => (readyState) => {
  const {menuLoadingWidth, loadingDelay, size} = options
  const Loader = options.Loader || (
    <LoadingComponent
      delay={loadingDelay}
      spinnerSize={size || 24}
      height={menuLoadingWidth ? 24 : undefined}
      width={menuLoadingWidth}
      showAfter={menuLoadingWidth ? 0 : undefined}
    />
  )
  const Error = options.Error || ErrorComponent
  const {error, props, retry} = readyState
  let child
  let key
  if (error) {
    const eventId = Sentry.captureException(error)
    key = 'Error'
    child = <Error error={error} eventId={eventId} />
  } else if (props) {
    key = 'Ready'
    child = <ReadyComponent {...(options.props || {})} viewer={props.viewer} retry={retry} />
  } else {
    key = 'Loading'
    child = Loader
  }
  return (
    <TransitionGroup appear component={React.Fragment}>
      <AnimatedFade key={key} exit={key !== 'Loading'} unmountOnExit={key === 'Loading'} slide={0}>
        {child}
      </AnimatedFade>
    </TransitionGroup>
  )
}

export default renderQuery
