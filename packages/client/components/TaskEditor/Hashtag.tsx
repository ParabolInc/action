import React, {ReactNode} from 'react'
import {PALETTE} from '../../styles/paletteV3'

// inline styles so oy-vey doesn't barf when making emails using draft-js cards
const style = {
  color: PALETTE.SLATE_700,
  fontWeight: 600
}

interface Props {
  children: ReactNode
  offsetkey: string
}

const Hashtag = (props: Props) => {
  const {offsetkey, children} = props
  return (
    <span data-offset-key={offsetkey} style={style}>
      {children}
    </span>
  )
}

export default Hashtag
