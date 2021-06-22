import React, {ReactNode} from 'react'
import {PALETTE} from '../../styles/paletteV3'

const style = {
  backgroundColor: PALETTE.GOLD_100,
  borderRadius: 2,
  fontWeight: 600
}

interface Props {
  children: ReactNode
  offsetkey: string
}

const Mention = (props: Props) => {
  const {offsetkey, children} = props
  return (
    <span data-offset-key={offsetkey} style={style}>
      {children}
    </span>
  )
}

export default Mention
