import PropTypes from 'prop-types'
import React from 'react'
import {
  emailBackgroundColor,
  emailBodyColor,
  emailFontFamily,
  emailFontSize,
  emailInnerMaxWidth,
  emailLineHeight,
  emailTableBase,
  emailTextColor
} from '../../styles'

const cellStyle = {
  color: emailTextColor,
  fontFamily: emailFontFamily,
  fontSize: emailFontSize,
  lineHeight: emailLineHeight,
  padding: '0px 16px'
} as const

const innerStyle = {
  ...cellStyle,
  margin: '0px auto',
  padding: '0px',
  width: '100%'
} as const

const EmailBlock = (props) => {
  const {align, hasBackgroundColor, children, innerMaxWidth} = props
  const backgroundColor = hasBackgroundColor ? emailBackgroundColor : emailBodyColor
  const maxWidth = innerMaxWidth || emailInnerMaxWidth
  return (
    <table align={align} style={{...emailTableBase, backgroundColor}} width='100%'>
      <tbody>
        <tr>
          <td align={align} style={cellStyle}>
            <div style={{...innerStyle, maxWidth}}>{children}</div>
          </td>
        </tr>
      </tbody>
    </table>
  )
}

EmailBlock.propTypes = {
  align: PropTypes.oneOf(['center', 'left']),
  children: PropTypes.any,
  hasBackgroundColor: PropTypes.bool,
  innerMaxWidth: PropTypes.number
}

EmailBlock.defaultProps = {
  align: 'left'
}

export default EmailBlock
