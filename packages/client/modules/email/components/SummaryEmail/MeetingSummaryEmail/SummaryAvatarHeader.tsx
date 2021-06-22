import graphql from 'babel-plugin-relay/macro'
import {PALETTE} from 'parabol-client/styles/paletteV3'
import {FONT_FAMILY} from 'parabol-client/styles/typographyV2'
import {SummaryAvatarHeader_meetingMember} from 'parabol-client/__generated__/SummaryAvatarHeader_meetingMember.graphql'
import React from 'react'
import {createFragmentContainer} from 'react-relay'

const presentLabelStyle = {
  color: PALETTE.JADE_400,
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontSize: '14px',
  fontStyle: 'italic',
  fontWeight: 600,
  paddingTop: 4
}

const avatarCell = {
  paddingTop: 24
}

const avatarStyles = {
  borderRadius: '100%',
  minWidth: 80
}

const nameStyle = {
  color: PALETTE.SLATE_700,
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontSize: '20px',
  paddingTop: 4
}

interface Props {
  meetingMember: SummaryAvatarHeader_meetingMember
}

const SummaryAvatarHeader = (props: Props) => {
  const {meetingMember} = props
  const {user} = meetingMember
  const {rasterPicture, preferredName} = user
  return (
    <>
      <tr>
        <td align='center' style={avatarCell}>
          <img height='80' src={rasterPicture} style={avatarStyles} width='80' />
        </td>
      </tr>
      <tr>
        <td align='center' style={nameStyle}>
          {preferredName}
        </td>
      </tr>
      <tr>
        <td align='center' style={presentLabelStyle}>
          {'Present'}
        </td>
      </tr>
    </>
  )
}

export default createFragmentContainer(SummaryAvatarHeader, {
  meetingMember: graphql`
    fragment SummaryAvatarHeader_meetingMember on MeetingMember {
      user {
        rasterPicture
        preferredName
      }
    }
  `
})
