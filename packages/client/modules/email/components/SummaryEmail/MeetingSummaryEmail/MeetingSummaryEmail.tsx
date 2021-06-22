import graphql from 'babel-plugin-relay/macro'
import React, {useEffect} from 'react'
import {createFragmentContainer} from 'react-relay'
// import './reactEmailDeclarations'
import SummarySheet from './SummarySheet'
import ViewInBrowserHeader from './ViewInBrowserHeader'

const parentStyles = {
  WebkitTextSizeAdjust: '100%',
  msTextSizeAdjust: '100%',
  msoTableLspace: '0pt',
  msoTableRspace: '0pt',
  borderCollapse: 'collapse',
  margin: '0px auto'
} as React.CSSProperties

export type MeetingSummaryReferrer = 'meeting' | 'email' | 'history'

interface Props {
  emailCSVUrl: string
  isDemo?: boolean
  meeting: any
  referrer: MeetingSummaryReferrer
  referrerUrl?: string
  teamDashUrl: string
  meetingUrl: string
  appOrigin: string
  urlAction?: 'csv'
}

const pagePadding = {
  paddingTop: 24
}

declare module 'react' {
  interface TdHTMLAttributes<T> {
    height?: string | number
    width?: string | number
    bgcolor?: string
  }
  interface TableHTMLAttributes<T> {
    align?: 'center' | 'left' | 'right'
    bgcolor?: string
    height?: string | number
    width?: string | number
  }
}

const PagePadding = () => {
  return (
    <table align='center' width='100%'>
      <tbody>
        <tr>
          <td style={pagePadding} />
        </tr>
      </tbody>
    </table>
  )
}

const MeetingSummaryEmail = (props: Props) => {
  const {referrer, referrerUrl} = props
  useEffect(() => {
    document.body.style.overflow = ''
    document.body.style.position = ''
  })
  return (
    <table width='100%' align='center' style={parentStyles}>
      <tbody>
        <tr>
          <td align='center'>
            <table width={600} align='center' style={parentStyles}>
              <tbody>
                <tr>
                  <td>
                    <PagePadding />
                    <ViewInBrowserHeader referrerUrl={referrerUrl} referrer={referrer} />
                    <SummarySheet {...props} />
                    <PagePadding />
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  )
}

export default createFragmentContainer(MeetingSummaryEmail, {
  meeting: graphql`
    fragment MeetingSummaryEmail_meeting on NewMeeting {
      id
      ...SummarySheet_meeting
    }
  `
})
