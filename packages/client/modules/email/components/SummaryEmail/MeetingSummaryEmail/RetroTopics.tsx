import graphql from 'babel-plugin-relay/macro'
import {PALETTE} from 'parabol-client/styles/paletteV3'
import {FONT_FAMILY} from 'parabol-client/styles/typographyV2'
import {RETRO_TOPIC_LABEL} from 'parabol-client/utils/constants'
import plural from 'parabol-client/utils/plural'
import {RetroTopics_meeting} from 'parabol-client/__generated__/RetroTopics_meeting.graphql'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import makeAppURL from '../../../../../utils/makeAppURL'
import EmailBorderBottom from './EmailBorderBottom'
import RetroTopic from './RetroTopic'

const sectionHeading = {
  color: PALETTE.SLATE_700,
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontSize: 24,
  fontWeight: 600,
  paddingTop: 24
}

interface Props {
  isDemo: boolean
  isEmail: boolean
  appOrigin: string
  meeting: RetroTopics_meeting
}

const RetroTopics = (props: Props) => {
  const {isDemo, isEmail, appOrigin, meeting} = props
  const {id: meetingId, reflectionGroups} = meeting
  if (!reflectionGroups) return null
  return (
    <>
      <tr>
        <td align='center' style={sectionHeading}>
          {plural(reflectionGroups.length, RETRO_TOPIC_LABEL)}
        </td>
      </tr>
      {reflectionGroups.map((topic, idx) => {
        const topicUrlPath = `/meet/${meetingId}/discuss/${idx + 1}`
        const topicUrl = isEmail
          ? makeAppURL(appOrigin, topicUrlPath, {
            searchParams: {
              utm_source: 'summary email',
              utm_medium: 'email',
              utm_campaign: 'after-meeting'
            }
          }) : topicUrlPath
        return (
          <RetroTopic
            key={topic.id}
            isDemo={isDemo}
            isEmail={isEmail}
            topic={topic}
            to={topicUrl}
          />
        )
      })}
      <EmailBorderBottom />
    </>
  )
}

export default createFragmentContainer(RetroTopics, {
  meeting: graphql`
    fragment RetroTopics_meeting on RetrospectiveMeeting {
      id
      reflectionGroups(sortBy: voteCount) {
        id
        ...RetroTopic_topic
      }
    }
  `
})
