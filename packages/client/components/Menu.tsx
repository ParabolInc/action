import React, {
  Children,
  cloneElement,
  forwardRef,
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react'
import styled from '@emotion/styled'
import MenuItemAnimation from './MenuItemAnimation'
import {PortalStatus} from '../hooks/usePortal'

const isMenuItem = (node: any) => node && node.onClick
const REACT_ELEMENT = Symbol.for('react.element')
const isReactElement = (child: any) => child && child.$$typeof === REACT_ELEMENT

const MenuStyles = styled('div')({
  maxHeight: 224,
  maxWidth: 400,
  outline: 0,
  // VERY important! If not present, draft-js gets confused & thinks the menu is the selection rectangle
  userSelect: 'none'
})

interface Props {
  ariaLabel: string
  children: ReactNode
  className?: string
  closePortal?: () => void
  defaultActiveIdx?: number
  keepParentFocus?: boolean
  resetActiveOnChanges?: any[]
  tabReturns?: boolean
  isDropdown?: boolean
  portalStatus: PortalStatus
}

const Menu = forwardRef((props: Props, ref: any) => {
  const {
    ariaLabel,
    children,
    className,
    closePortal,
    defaultActiveIdx = null,
    isDropdown,
    keepParentFocus,
    resetActiveOnChanges,
    portalStatus,
    tabReturns
  } = props
  const [activeIdx, setActiveIdx] = useState<number | null>(defaultActiveIdx)
  const menuRef = useRef<HTMLDivElement>(null)
  const itemHandles = useRef<{onClick: (e?: React.MouseEvent | React.KeyboardEvent) => void}[]>([])
  const initialDefaultActiveIdxRef = useRef(activeIdx)
  useEffect(() => {
    // support an active index that is async fetched
    if (defaultActiveIdx && !initialDefaultActiveIdxRef.current) {
      setActiveIdx(defaultActiveIdx)
    }
  }, [defaultActiveIdx])
  useImperativeHandle(ref, () => ({
    handleKeyDown
  }))

  useEffect(
    () => {
      if (!keepParentFocus) menuRef.current && menuRef.current.focus()
    },
    resetActiveOnChanges ||
      [
        /* eslint-disable-line react-hooks/exhaustive-deps*/
      ]
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (keepParentFocus) {
        // used for e.g. the emoji menu
        e.preventDefault()
      }
    },
    [keepParentFocus]
  )

  const setSafeIdx = useCallback(
    (idx: number | null) => {
      const childArr = itemHandles.current
      const menuItemIdxs = [] as number[]
      childArr.forEach((item, index) => {
        if (isMenuItem(item)) {
          menuItemIdxs.push(index)
        }
      })

      const firstIndex = menuItemIdxs[0]
      const lastIndex = menuItemIdxs[menuItemIdxs.length - 1]

      if (idx === null) setActiveIdx(firstIndex)
      else if (menuItemIdxs.includes(idx)) setActiveIdx(idx)
      else if (idx < firstIndex) setActiveIdx(lastIndex)
      else if (idx > lastIndex) setActiveIdx(firstIndex)
      else if (activeIdx && idx > activeIdx) {
        for (let ii = idx; ii <= lastIndex; ii++) {
          if (menuItemIdxs.includes(ii)) {
            setActiveIdx(ii)
            break
          }
        }
      } else {
        for (let ii = idx; ii >= firstIndex; ii--) {
          if (menuItemIdxs.includes(ii)) {
            setActiveIdx(ii)
            break
          }
        }
      }
    },
    [activeIdx]
  )

  const makeSmartChildren = useCallback(
    (children: ReactNode) => {
      // toArray removes bools whereas map does not. Use the filter to remove possible portals
      const childArr = Children.toArray(children)
      const itemCount = childArr.length
      return childArr.map((child, idx) => {
        if (!child) return null
        if (!isReactElement(child)) return child
        // overloading a ref callback with useful props means intermediary components only need to forward the ref
        const ref = (c) => {
          itemHandles.current[idx] = c
        }
        ref.closePortal = closePortal
        ref.isActive = activeIdx === idx
        ref.activate = () => setSafeIdx(idx)
        return (
          <MenuItemAnimation
            key={`mi${(child as any).key || child}`}
            idx={idx}
            itemsToAnimate={Math.min(10, itemCount)}
            isDropdown={!!isDropdown}
            portalStatus={portalStatus}
          >
            {cloneElement(child as ReactElement, {ref})}
          </MenuItemAnimation>
        )
      })
    },
    [activeIdx, setSafeIdx, closePortal, isDropdown, portalStatus]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSafeIdx(activeIdx === null ? null : activeIdx + 1)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSafeIdx(activeIdx === null ? null : activeIdx - 1)
      } else if (e.key === 'Enter' || (tabReturns && e.key === 'Tab')) {
        e.preventDefault()
        if (activeIdx !== null) {
          const itemHandle = itemHandles.current[activeIdx]
          itemHandle?.onClick?.(e)
        }
      } else if (e.key === 'Tab') {
        e.preventDefault()
        closePortal?.()
      }
      return e.defaultPrevented
    },
    [activeIdx, tabReturns, closePortal, setSafeIdx]
  )

  return (
    <MenuStyles
      role='menu'
      aria-label={ariaLabel}
      className={className}
      tabIndex={-1}
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
      ref={menuRef}
    >
      {makeSmartChildren(children)}
    </MenuStyles>
  )
})

export default Menu
