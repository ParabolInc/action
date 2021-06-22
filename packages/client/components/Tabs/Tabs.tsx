import React, {Children, cloneElement, Component, ReactElement, ReactNode} from 'react'
import styled from '@emotion/styled'
import {PALETTE} from '../../styles/paletteV3'
import getBBox from '../RetroReflectPhase/getBBox'

interface Props {
  activeIdx: number
  children: ReactNode
  className?: string
}

const INKBAR_HEIGHT = 2

const InkBar = styled('div')({
  background: PALETTE.GRAPE_700,
  bottom: 0,
  height: INKBAR_HEIGHT,
  left: 0,
  position: 'absolute',
  transformOrigin: 'left',
  transition: 'all 300ms',
  width: 1000
})

const TabsAndBar = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  maxWidth: '24rem',
  position: 'relative',
  width: '100%'
})

const TabHeaders = styled('div')({
  display: 'flex',
  width: '100%'
})

class Tabs extends Component<Props> {
  activeChildRef?: HTMLDivElement
  parentRef?: HTMLDivElement

  state = {
    transform: `scaleX(0)`
  }
  setChildRef = (c) => {
    if (c && c !== this.activeChildRef) {
      this.moveInkBar(this.parentRef, c)
    }
    this.activeChildRef = c
  }

  setParentRef = (c) => {
    if (c && c !== this.parentRef) {
      this.moveInkBar(c, this.activeChildRef)
    }
    this.parentRef = c
  }

  moveInkBar = (parent: HTMLDivElement | undefined, child: HTMLDivElement | undefined) => {
    const childBBox = child && getBBox(child)
    const parentBBox = parent && getBBox(parent)
    if (!childBBox || !parentBBox) return
    const left = childBBox.left - parentBBox.left
    this.setState({
      transform: `translate3d(${left}px, 0, 0)scaleX(${childBBox.width / 1000})`
    })
  }

  render() {
    const {activeIdx, children, className} = this.props
    const {transform} = this.state
    const properChildren = Children.map(children, (child, idx) => {
      const isActive = idx === activeIdx
      return cloneElement(child as ReactElement<any>, {
        isActive,
        ref: isActive ? this.setChildRef : null
      })
    })
    return (
      <TabsAndBar className={className} ref={this.setParentRef}>
        <TabHeaders>{properChildren}</TabHeaders>
        <InkBar style={{transform}} />
      </TabsAndBar>
    )
  }
}

export default Tabs
