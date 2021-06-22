import styled from '@emotion/styled'
import React, {ReactNode} from 'react'
import {DECELERATE} from '../styles/animation'
import {NavSidebar, ZIndex} from '../types/constEnums'

const DURATION = 200

interface StyleProps {
  isOpen: boolean
  isRightDrawer?: boolean
}
const Placeholder = styled('div')<StyleProps>(({isOpen}) => ({
  minWidth: isOpen ? NavSidebar.WIDTH : 0,
  maxWidth: isOpen ? NavSidebar.WIDTH : 0,
  // changing width is expensive, but this is only run on non-mobile devices, so it's not horrible & looks better than alternatives
  transition: `all ${DURATION}ms ${DECELERATE}`,
  // needs to be above the main view area
  zIndex: ZIndex.SIDE_SHEET
}))

const Fixed = styled('div')<StyleProps>(({isOpen, isRightDrawer}) => ({
  position: 'fixed',
  transform: isRightDrawer ? undefined : `translateX(${isOpen ? 0 : -NavSidebar.WIDTH}px)`,
  transition: `all ${DURATION}ms ${DECELERATE}`
}))

interface Props {
  children: ReactNode
  isOpen: boolean
  isRightDrawer?: boolean
}

const StaticSidebar = (props: Props) => {
  const {children, isOpen, isRightDrawer = false} = props
  return (
    <Placeholder isOpen={isOpen}>
      <Fixed isOpen={isOpen} isRightDrawer={isRightDrawer}>
        {children}
      </Fixed>
    </Placeholder>
  )
}

export default StaticSidebar
