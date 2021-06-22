import graphql from 'babel-plugin-relay/macro'
import Parser from 'json2csv/lib/JSON2CSVParser' // only grab the sync parser
import withAtmosphere, {
  WithAtmosphereProps
} from 'parabol-client/decorators/withAtmosphere/withAtmosphere'
import {PALETTE} from 'parabol-client/styles/paletteV3'
import extractTextFromDraftString from 'parabol-client/utils/draftjs/extractTextFromDraftString'
import withMutationProps, {WithMutationProps} from 'parabol-client/utils/relay/withMutationProps'
import {ExportToCSVQuery} from 'parabol-client/__generated__/ExportToCSVQuery.graphql'
import React, {Component} from 'react'
import {fetchQuery} from 'react-relay'
import JiraServiceTaskId from '../../../../shared/gqlIds/JiraServiceTaskId'
import {ExternalLinks, PokerCards} from '../../../../types/constEnums'
import AnchorIfEmail from './MeetingSummaryEmail/AnchorIfEmail'
import EmailBorderBottom from './MeetingSummaryEmail/EmailBorderBottom'
import {MeetingSummaryReferrer} from './MeetingSummaryEmail/MeetingSummaryEmail'

interface Props extends WithAtmosphereProps, WithMutationProps {
  meetingId: string
  urlAction?: 'csv' | undefined
  emailCSVUrl: string
  referrer: MeetingSummaryReferrer
}

graphql`
  fragment ExportToCSV_threadSource on ThreadSource {
    id
    thread(first: 1000) {
      edges {
        node {
          __typename
          content
          createdAt
          createdByUser {
            preferredName
          }
          replies {
            __typename
            content
            createdAt
            createdByUser {
              preferredName
            }
          }
        }
      }
    }
  }
`

const query = graphql`
  query ExportToCSVQuery($meetingId: ID!) {
    viewer {
      newMeeting(meetingId: $meetingId) {
        meetingType
        team {
          name
        }
        endedAt
        ... on PokerMeeting {
          phases {
            phaseType
            ... on EstimatePhase {
              stages {
                serviceTaskId
                finalScore
                dimensionRef {
                  name
                }
                story {
                  title
                }
                scores {
                  label
                }
              }
            }
          }
        }
        ... on ActionMeeting {
          agendaItems {
            content
            ...ExportToCSV_threadSource @relay(mask: false)
          }
          meetingMembers {
            tasks {
              content
              createdAt
              agendaItem {
                content
              }
            }
            user {
              preferredName
            }
          }
        }
        ... on RetrospectiveMeeting {
          reflectionGroups(sortBy: stageOrder) {
            ...ExportToCSV_threadSource @relay(mask: false)
            reflections {
              content
              createdAt
              prompt {
                question
              }
            }
            tasks {
              content
              createdAt
              createdByUser {
                preferredName
              }
            }
            title
            voteCount
          }
        }
      }
    }
  }
`

type Meeting = NonNullable<NonNullable<ExportToCSVQuery['response']['viewer']>['newMeeting']>
type ExportableTypeName = 'Task' | 'Reflection' | 'Comment' | 'Reply'

interface CSVPokerRow {
  story: string
  dimension: string
  finalScore: string | number
  voteCount: number
}
interface CSVRetroRow {
  reflectionGroup: string
  author: string
  votes: number
  prompt: string
  type: ExportableTypeName
  createdAt: string
  discussionThread: string
  content: string
}

interface CSVActionRow {
  author: string
  status: 'present' | 'absent'
  agendaItem: string
  type: ExportableTypeName
  createdAt: string
  discussionThread: string
  content: string
}

const label = 'Export to CSV'

const iconLinkLabel = {
  color: PALETTE.SLATE_700,
  fontSize: '13px',
  paddingTop: 32
}

const labelStyle = {
  paddingLeft: 8
}
const imageStyle = {
  verticalAlign: 'middle'
}

class ExportToCSV extends Component<Props> {
  componentDidMount() {
    if (this.props.urlAction === 'csv') {
      this.exportToCSV().catch()
    }
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    if (this.props.urlAction === 'csv' && prevProps.urlAction !== 'csv') {
      this.exportToCSV().catch()
    }
  }

  handlePokerMeeting(meeting: Meeting) {
    const rows = [] as CSVPokerRow[]
    const {phases} = meeting
    const estimatePhase = phases!.find((phase) => phase.phaseType === 'ESTIMATE')!
    const stages = estimatePhase.stages!
    stages.forEach((stage) => {
      const {finalScore, dimensionRef, story, scores, serviceTaskId} = stage
      const {name} = dimensionRef
      const {issueKey} = JiraServiceTaskId.split(serviceTaskId)
      const title = story?.title ?? issueKey
      const voteCount = scores.filter((score) => score.label !== PokerCards.PASS_CARD).length
      rows.push({
        story: title,
        dimension: name,
        finalScore: finalScore || '',
        voteCount
      })
    })
    return rows
  }
  handleRetroMeeting(newMeeting: Meeting) {
    const {reflectionGroups} = newMeeting

    const rows = [] as CSVRetroRow[]
    reflectionGroups!.forEach((group) => {
      const {reflections, title, voteCount: votes, thread} = group
      reflections.forEach((reflection) => {
        rows.push({
          reflectionGroup: title!,
          author: 'Anonymous',
          votes,
          type: 'Reflection',
          createdAt: reflection.createdAt!,
          discussionThread: '',
          prompt: reflection.prompt.question,
          content: extractTextFromDraftString(reflection.content)
        })
      })
      thread?.edges.forEach((edge) => {
        const threadableContent = extractTextFromDraftString(edge.node.content)
        rows.push({
          reflectionGroup: title!,
          author: edge!.node!.createdByUser?.preferredName ?? 'Anonymous',
          votes,
          type: edge.node.__typename as ExportableTypeName,
          createdAt: edge.node.createdAt,
          discussionThread: threadableContent,
          prompt: '',
          content: threadableContent
        })
        edge.node.replies.forEach((reply) => {
          rows.push({
            reflectionGroup: title!,
            author: reply!.createdByUser?.preferredName ?? 'Anonymous',
            votes,
            type: reply.__typename === 'Task' ? 'Task' : 'Reply',
            createdAt: reply.createdAt,
            discussionThread: threadableContent,
            prompt: '',
            content: extractTextFromDraftString(reply.content)
          })
        })
      })
    })
    return rows
  }

  handleActionMeeting(newMeeting: Meeting) {
    const {meetingMembers, agendaItems} = newMeeting

    const rows = [] as CSVActionRow[]
    meetingMembers!.forEach((meetingMember) => {
      const {tasks, user} = meetingMember
      const {preferredName} = user
      if (tasks.length === 0) {
        rows.push({
          author: preferredName,
          status: 'present',
          agendaItem: '',
          type: 'Task',
          createdAt: '',
          discussionThread: '',
          content: ''
        })
        return
      }
    })
    agendaItems!.forEach((agendaItem) => {
      const {thread} = agendaItem
      thread?.edges.forEach((edge) => {
        const commentContent = extractTextFromDraftString(edge.node.content)
        const authorName = edge!.node!.createdByUser?.preferredName ?? 'Anonymous'
        rows.push({
          author: authorName,
          status: 'present',
          agendaItem: agendaItem ? agendaItem.content : '',
          type: edge.node.__typename as ExportableTypeName,
          createdAt: edge.node.createdAt,
          discussionThread: commentContent,
          content: commentContent
        })
        edge.node.replies.forEach((reply) => {
          const authorName = reply.createdByUser?.preferredName ?? 'Anonymous'
          rows.push({
            author: authorName,
            status: 'present',
            agendaItem: agendaItem ? agendaItem.content : '',
            type: reply.__typename === 'Task' ? 'Task' : 'Reply',
            createdAt: reply.createdAt,
            discussionThread: commentContent,
            content: extractTextFromDraftString(reply.content)
          })
        })
      })
    })
    return rows
  }

  getRows(newMeeting: Meeting) {
    switch (newMeeting.meetingType) {
      case 'action':
        return this.handleActionMeeting(newMeeting)
      case 'retrospective':
        return this.handleRetroMeeting(newMeeting)
      case 'poker':
        return this.handlePokerMeeting(newMeeting)
      default:
        return []
    }
  }

  exportToCSV = async () => {
    const {atmosphere, meetingId, submitMutation, submitting, onCompleted} = this.props
    if (submitting) return
    submitMutation()
    const data = await fetchQuery<ExportToCSVQuery>(atmosphere, query, {meetingId})
    onCompleted()
    const {viewer} = data
    if (!viewer) return
    const {newMeeting} = viewer
    if (!newMeeting) return
    const rows = this.getRows(newMeeting)
    const {endedAt, team, meetingType} = newMeeting
    const {name: teamName} = team
    const label = meetingType[0].toUpperCase() + meetingType.slice(1)
    const parser = new Parser({withBOM: true, eol: '\n'})
    const csv = parser.parse(rows)
    const date = new Date(endedAt!)
    const numDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    // copied from https://stackoverflow.com/questions/18848860/javascript-array-to-csv/18849208#18849208
    // note: using encodeUri does NOT work on the # symbol & breaks
    const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'})
    const encodedUri = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Parabol${label}_${teamName}_${numDate}.csv`)
    document.body.appendChild(link) // Required for FF
    link.click()
    document.body.removeChild(link)
  }

  render() {
    const {emailCSVUrl, referrer} = this.props
    return (
      <>
        <tr>
          <td align='center' style={iconLinkLabel} width='100%'>
            <AnchorIfEmail isEmail={referrer === 'email'} href={emailCSVUrl} title={label}>
              <img
                crossOrigin=''
                alt={label}
                src={`${ExternalLinks.EMAIL_CDN}cloud_download.png`}
                style={imageStyle}
              />
              <span style={labelStyle}>{label}</span>
            </AnchorIfEmail>
          </td>
        </tr>
        <EmailBorderBottom />
      </>
    )
  }
}

export default withAtmosphere(withMutationProps(ExportToCSV))
