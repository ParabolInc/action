import React, {
  forwardRef,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useRef,
  RefObject
} from 'react'
import styled from '@emotion/styled'
import MenuItemLabel from './MenuItemLabel'
import {PALETTE} from '../styles/paletteV3'

export interface MenuItemProps {
  isActive: boolean
  activate: () => void
  closePortal: () => void
}

interface Props {
  isDisabled?: boolean
  label: ReactNode
  dataCy?: string
  onClick?: (e: React.MouseEvent) => void
  onMouseEnter?: (e: React.MouseEvent) => void
  noCloseOnClick?: boolean
  onView?: () => void // the viewer has scrolled to where the content is 90% in view
  parentRef?: RefObject<HTMLDivElement>
}

const MenuItemStyles = styled('div')<{isActive: boolean; isDisabled: boolean | undefined}>(
  ({isActive, isDisabled}) => ({
    alignItems: 'center',
    backgroundColor: isActive ? PALETTE.SLATE_200 : undefined,
    color: isDisabled ? PALETTE.SLATE_600 : PALETTE.SLATE_700,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    '&:hover,:focus': {
      backgroundColor: isActive ? PALETTE.SLATE_200 : PALETTE.SLATE_100,
      outline: 0
    }
  })
)

const MINIMUM_VIEW_TIME = 300

const getIsHidden = (el: HTMLElement, parent: HTMLElement) => {
  const isViewedThreshold = el.offsetTop + el.clientHeight * 0.9 // you must see 90% to have it count as viewed
  const parentBottom = parent.clientHeight + parent.scrollTop
  return parentBottom < isViewedThreshold
}
const MenuItem = forwardRef((props: Props, ref: any) => {
  const {isDisabled, label, noCloseOnClick, onMouseEnter, onClick, onView, parentRef, dataCy} = props
  const itemRef = useRef<HTMLDivElement>(null)
  // we're doing something a little hacky here, overloading a callback ref with some props so we don't need to pass them explicitly
  const {activate, closePortal, isActive} = ref as MenuItemProps

  useEffect(() => {
    if (isActive && itemRef.current) {
      itemRef.current.scrollIntoViewIfNeeded()
    }
  }, [isActive])

  useEffect(() => {
    if (!onView || !parentRef) return
    const timer = setTimeout(() => {
      const {current: el} = itemRef
      if (!el) return
      const parent = parentRef.current
      if (!parent) {
        console.error('No parent found for notifications')
        return
      }
      const isHidden = getIsHidden(el, parent)
      if (!isHidden) {
        onView()
        return
      }
      const handler = () => {
        if (!getIsHidden(el, parent)) {
          parent.removeEventListener('scroll', handler)
          onView()
        }
      }
      parent.addEventListener('scroll', handler, {passive: true})
    }, MINIMUM_VIEW_TIME)

    return () => {
      window.clearTimeout(timer)
    }
  }, [])

  const handleClick = (e) => {
    if (isDisabled) return
    if (noCloseOnClick) {
      activate()
    } else if (closePortal) {
      closePortal()
    }
    if (onClick) {
      onClick(e)
    }
  }

  useImperativeHandle(ref, () => ({
    onClick: handleClick
  }))

  return (
    <MenuItemStyles
      isDisabled={isDisabled}
      role='menuitem'
      ref={itemRef}
      isActive={isActive}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
    >
      {typeof label === 'string' ? <MenuItemLabel data-cy={dataCy}>{label}</MenuItemLabel> : label}
    </MenuItemStyles>
  )
})

export default MenuItem
