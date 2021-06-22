import {PALETTE} from 'parabol-client/styles/paletteV3'
import React from 'react'

const borderStyles = {
  borderBottom: `1px solid ${PALETTE.SLATE_400}`,
  paddingBottom: 24
} as React.CSSProperties

const EmailBorderBottom = (props) => {
  const {dataCy} = props
  if (!dataCy)
    return (
      <tr>
        <td style={borderStyles} />
      </tr>
    )
  else
    return (
      <tr>
        <td data-cy={dataCy} style={borderStyles} />
      </tr>
    )
}

export default EmailBorderBottom
