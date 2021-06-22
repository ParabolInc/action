import React from 'react'
import {emailCopyStyle, emailTableBase, emailTextColorLight} from '../../styles'
import EmptySpace from '../EmptySpace/EmptySpace'

const copyStyle = {
  ...emailCopyStyle,
  color: emailTextColorLight,
  fontSize: '13px',
  lineHeight: '20px',
  margin: 0,
  textAlign: 'left'
} as const

const boldCopyStyle = {
  ...copyStyle,
  fontWeight: 600
} as const

const linkStyle = {
  ...copyStyle,
  textDecoration: 'underline'
} as const

const year = new Date().getFullYear()

const EmailFooter = () => {
  return (
    <table align='left' width='100%' style={emailTableBase}>
      <tbody>
        <tr>
          <td>
            <EmptySpace height={24} />
            <div style={copyStyle}>
              {`©${year} Parabol, Inc.`}
              <br />
              <span style={boldCopyStyle}>{'Get in touch'}</span>
              {': '}
              <a href='mailto:love@parabol.co' title='Get in touch' style={linkStyle}>
                {'love@parabol.co'}
              </a>
            </div>
            <EmptySpace height={8} />
          </td>
        </tr>
      </tbody>
    </table>
  )
}

export default EmailFooter
