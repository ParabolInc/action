import React from 'react'
import makeActionStats from './makeActionStats'
import makeRetroStats from './makeRetroStats'
import {ACTION, RETROSPECTIVE} from '../../../../../utils/constants'
import {PALETTE} from '../../../../../styles/paletteV2'
import {FONT_FAMILY} from '../../../../../styles/typographyV2'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {QuickStats_meeting} from '../../../../../__generated__/QuickStats_meeting.graphql'

const statLabel = (idx, len) =>
  ({
    color: PALETTE.TEXT_MAIN,
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
    color: PALETTE.TEXT_GRAY,
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
  [RETROSPECTIVE]: makeRetroStats
}

const QuickStats = (props: Props) => {
  const {meeting} = props
  const {meetingType} = meeting
  const quickStatMaker = quickStatsLookup[meetingType]
  const stats = quickStatMaker(meeting as any)
  return (
    <table width='75%' align='center' style={tableStyle}>
      <tbody>
        <tr>
          {stats.map((stat, idx) => {
            return (
              <td
                key={stat.label}
                width='25%'
                align='center'
                bgcolor={PALETTE.BACKGROUND_MAIN}
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
                key={stat.label}
                width='25%'
                align='center'
                bgcolor={PALETTE.BACKGROUND_MAIN}
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
      ... on RetrospectiveMeeting {
        reflectionGroups {
          voteCount
          reflections {
            id
          }
        }
        meetingMembers {
          isCheckedIn
          tasks {
            id
          }
        }
      }
      ... on ActionMeeting {
        meetingMembers {
          isCheckedIn
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
