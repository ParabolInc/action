import styled from '@emotion/styled'
import React, {useEffect, useLayoutEffect, useRef} from 'react'
import useForceUpdate from '~/hooks/useForceUpdate'
import useAtmosphere from '../hooks/useAtmosphere'
import useBreakpoint from '../hooks/useBreakpoint'
import useEventCallback from '../hooks/useEventCallback'
import usePortal from '../hooks/usePortal'
import useRouter from '../hooks/useRouter'
import useTransition from '../hooks/useTransition'
import {Breakpoint, NavSidebar, ZIndex} from '../types/constEnums'
import clientTempId from '../utils/relay/clientTempId'
import SnackbarMessage from './SnackbarMessage'

const MAX_SNACKS = 1

const Modal = styled('div')<{isMeetingRoute: boolean; isDesktop: boolean}>(
  ({isMeetingRoute, isDesktop}) => ({
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    justifyContent: 'flex-end',
    left: 0,
    padding: 8,
    paddingBottom: isMeetingRoute ? 64 : 8,
    position: 'fixed',
    top: 0,
    width: isMeetingRoute && isDesktop ? `calc(100% + ${NavSidebar.WIDTH}px)` : '100%',
    pointerEvents: 'none',
    zIndex: ZIndex.SNACKBAR
  })
)

export type SnackbarRemoveFn = (snack: Snack) => boolean

export interface SnackAction {
  label: string
  callback: () => void
}

export interface Snack {
  key: string // string following format: `type` OR `type:variable`
  message: string
  autoDismiss: number // seconds. 0 means never dismiss
  noDismissOnClick?: boolean // clicking has no effect on the show state
  onDismiss?: () => void
  action?: SnackAction
  secondaryAction?: SnackAction
}

const Snackbar = React.memo(() => {
  const snackQueueRef = useRef<Snack[]>([])
  const activeSnacksRef = useRef<Snack[]>([])
  const forceUpdate = useForceUpdate()
  const atmosphere = useAtmosphere()
  const {openPortal, terminatePortal, portal} = usePortal({id: 'snackbar', noClose: true})
  const {location} = useRouter()
  const isMeetingRoute = location.pathname.startsWith('/meet/')
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const transitionChildren = useTransition(activeSnacksRef.current)
  // used to ensure the snack isn't dismissed when the cursor is on it
  const hoveredSnackRef = useRef<Snack | null>(null)
  const dismissOnLeaveRef = useRef<Snack>()

  const filterSnacks = useEventCallback((removeFn: SnackbarRemoveFn) => {
    const filterFn = (snack: Snack) => !removeFn(snack)
    snackQueueRef.current = snackQueueRef.current.filter(filterFn)
    const nextSnacks = activeSnacksRef.current.filter(filterFn)
    if (nextSnacks.length !== activeSnacksRef.current.length) {
      activeSnacksRef.current = nextSnacks
      forceUpdate()
    }
  })

  const dismissSnack = useEventCallback((snackToDismiss: Snack) => {
    snackToDismiss.onDismiss?.()
    filterSnacks((snack: Snack) => snack === snackToDismiss)
  })

  const showSnack = useEventCallback((snack: Snack) => {
    activeSnacksRef.current = [...activeSnacksRef.current, snack]
    if (snack.autoDismiss !== 0) {
      setTimeout(() => {
        if (hoveredSnackRef.current === snack) {
          dismissOnLeaveRef.current = snack
        } else {
          dismissSnack(snack)
        }
      }, snack.autoDismiss * 1000)
    }
    forceUpdate()
  })

  const onMouseEnter = (snack: Snack) => () => {
    hoveredSnackRef.current = snack
  }

  const onMouseLeave = () => {
    if (dismissOnLeaveRef.current) {
      dismissSnack(dismissOnLeaveRef.current)
      dismissOnLeaveRef.current = undefined
    }
    hoveredSnackRef.current = null
  }

  const handleAdd = useEventCallback((snack) => {
    const dupeFilter = ({key}: Snack) => key === snack.key
    const snackInQueue = snackQueueRef.current.find(dupeFilter)
    const snackIsActive = activeSnacksRef.current.find(dupeFilter)
    if (snackInQueue || snackIsActive) return
    // This is temporary until these errors stop showing up in sentry
    if (typeof snack.message !== 'string') {
      console.error(`Bad snack message: ${snack.key}`)
      if (snack.message.message) {
        snack.message = snack.message.message
      } else {
        return
      }
    }
    const keyedSnack = {key: clientTempId(), ...snack}
    if (transitionChildren.length < MAX_SNACKS) {
      showSnack(keyedSnack)
    } else {
      snackQueueRef.current.push(keyedSnack)
    }
  })

  // handle events
  useEffect(() => {
    atmosphere.eventEmitter.on('addSnackbar', handleAdd)
    atmosphere.eventEmitter.on('removeSnackbar', filterSnacks)
    return () => {
      atmosphere.eventEmitter.off('addSnackbar', handleAdd)
      atmosphere.eventEmitter.off('removeSnackbar', filterSnacks)
    }
  }, [])

  // handle portal
  useLayoutEffect(() => {
    if (transitionChildren.length === 0 && snackQueueRef.current.length === 0) {
      terminatePortal()
    } else {
      openPortal()
    }
  }, [openPortal, terminatePortal, transitionChildren])

  // handle queue
  useEffect(() => {
    if (snackQueueRef.current.length > 0 && transitionChildren.length < MAX_SNACKS) {
      showSnack(snackQueueRef.current.shift()!)
    }
  }, [showSnack, transitionChildren])

  return portal(
    <Modal isMeetingRoute={isMeetingRoute} isDesktop={isDesktop}>
      {transitionChildren.map(({child, onTransitionEnd, status}) => {
        const dismiss = () => {
          if (child.noDismissOnClick) return
          dismissSnack(child)
        }
        return (
          <SnackbarMessage
            key={child.key}
            message={child.message}
            action={child.action}
            secondaryAction={child.secondaryAction}
            status={status}
            onTransitionEnd={onTransitionEnd}
            dismissSnack={dismiss}
            onMouseEnter={onMouseEnter(child)}
            onMouseLeave={onMouseLeave}
          />
        )
      })}
    </Modal>
  )
})

export default Snackbar
