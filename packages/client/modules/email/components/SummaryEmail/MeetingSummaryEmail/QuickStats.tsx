import graphql from 'babel-plugin-relay/macro'
import {PALETTE} from 'parabol-client/styles/paletteV3'
import {FONT_FAMILY} from 'parabol-client/styles/typographyV2'
import {ACTION, RETROSPECTIVE} from 'parabol-client/utils/constants'
import {QuickStats_meeting} from 'parabol-client/__generated__/QuickStats_meeting.graphql'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import makeActionStats from './makeActionStats'
import makePokerStats from './makePokerStats'
import makeRetroStats from './makeRetroStats'

const statLabel = (idx, len) =>
({
  color: PALETTE.SLATE_700,
  fontFamily: FONT_FAMILY.SANS_SERIF,
  borderTopLeftRadius: idx === 0 ? 4 : 0,
  borderTopRightRadius: idx === len - 1 ? 4 : 0,
  fontSize: 36,
  lineHeight: '40px',
  paddingTop: 12
} as React.CSSProperties)

const descriptionLabel = (idx, len) =>
({
  fontFamily: FONT_FAMILY.SANS_SERIF,
  borderBottomLeftRadius: idx === 0 ? 4 : 0,
  borderBottomRightRadius: idx === len - 1 ? 4 : 0,
  color: PALETTE.SLATE_600,
  fontSize: 10,
  fontWeight: 600,
  paddingBottom: 12,
  textTransform: 'uppercase'
} as React.CSSProperties)

const tableStyle = {
  borderSpacing: '2px 0',
  paddingTop: 24,
  borderRadius: '4px'
} as React.CSSProperties

interface Props {
  meeting: QuickStats_meeting
}

const quickStatsLookup = {
  [ACTION]: makeActionStats,
  [RETROSPECTIVE]: makeRetroStats,
  poker: makePokerStats
}

const QuickStats = (props: Props) => {
  const {meeting} = props
  const {meetingType} = meeting
  const quickStatMaker = quickStatsLookup[meetingType]
  if (!quickStatMaker) return null
  const stats = quickStatMaker(meeting as any)
  return (
    <table width='75%' align='center' style={tableStyle}>
      <tbody>
        <tr>
          {stats.map((stat, idx) => {
            return (
              <td
                key={idx}
                width='25%'
                align='center'
                bgcolor={stat.label ? PALETTE.SLATE_200 : undefined}
                style={statLabel(idx, stats.length)}
              >
                {stat.value}
              </td>
            )
          })}
        </tr>
        <tr>
          {stats.map((stat, idx) => {
            return (
              <td
                key={idx}
                width='25%'
                align='center'
                bgcolor={stat.label ? PALETTE.SLATE_200 : undefined}
                style={descriptionLabel(idx, stats.length)}
              >
                {stat.label}
              </td>
            )
          })}
        </tr>
      </tbody>
    </table>
  )
}

export default createFragmentContainer(QuickStats, {
  meeting: graphql`
    fragment QuickStats_meeting on NewMeeting {
      __typename
      meetingType
      ...makePokerStats_meeting
      ... on RetrospectiveMeeting {
        reflectionGroups(sortBy: voteCount) {
          voteCount
          reflections {
            id
          }
        }
        meetingMembers {
          tasks {
            id
          }
        }
      }
      ... on ActionMeeting {
        meetingMembers {
          doneTasks {
            id
          }
          tasks {
            id
          }
        }
        phases {
          phaseType
          ... on AgendaItemsPhase {
            stages {
              __typename
              isComplete
            }
          }
        }
      }
    }
  `
})
