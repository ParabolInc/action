import PropTypes from 'prop-types'
import React from 'react'
import {emailPrimaryButtonStyle, emailTableBase} from '../styles'

const cellStyle = {
  color: '#FFFFFF',
  fontWeight: 600,
  padding: 0,
  textAlign: 'center'
} as React.CSSProperties

const linkStyle = {
  ...emailPrimaryButtonStyle,
  width: '100%'
} as React.CSSProperties

const Button = (props) => {
  const {url, width} = props
  return (
    <table style={{...emailTableBase, width}} width={width}>
      <tbody>
        <tr>
          <td align='center' style={cellStyle}>
            <a href={url} style={linkStyle}>
              {props.children}
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  )
}

Button.defaultProps = {
  width: 240
}

Button.propTypes = {
  children: PropTypes.any,
  url: PropTypes.string,
  width: PropTypes.number
}

export default Button
