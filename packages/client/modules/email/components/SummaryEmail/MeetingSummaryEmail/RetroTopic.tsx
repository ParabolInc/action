import graphql from 'babel-plugin-relay/macro'
import useEmailItemGrid from 'parabol-client/hooks/useEmailItemGrid'
import {PALETTE} from 'parabol-client/styles/paletteV3'
import {FONT_FAMILY, ICON_SIZE} from 'parabol-client/styles/typographyV2'
import plural from 'parabol-client/utils/plural'
import {RetroTopic_topic} from 'parabol-client/__generated__/RetroTopic_topic.graphql'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {ExternalLinks} from '../../../../../types/constEnums'
import AnchorIfEmail from './AnchorIfEmail'
import EmailReflectionCard from './EmailReflectionCard'

const topicThemeHeading = {
  color: PALETTE.SLATE_700,
  display: 'block',
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontSize: 16,
  fontWeight: 600,
  textDecoration: 'none'
}

const votesBlock = {
  fontSize: 14,
  fontWeight: 600,
  lineHeight: ICON_SIZE.MD18,
  padding: '8px 0px'
}

const voteCountStyle = {
  color: PALETTE.SLATE_600,
  paddingLeft: 4,
  textDecoration: 'none'
}

const imageStyle = {
  verticalAlign: 'text-bottom'
}

const someCommentsLinkStyle = {
  color: PALETTE.SKY_500,
  display: 'block',
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontSize: 13,
  fontWeight: 600,
  textDecoration: 'none'
}

const noCommentLinkStyle = {
  ...someCommentsLinkStyle,
  color: PALETTE.SLATE_600
}

interface Props {
  isDemo: boolean
  isEmail: boolean
  topic: RetroTopic_topic
  to: string
}

const RetroTopic = (props: Props) => {
  const {isDemo, isEmail, to, topic} = props
  const {reflections, title, voteCount, commentCount} = topic
  const imageSource = isEmail ? 'static' : 'local'
  const icon = imageSource === 'local' ? 'thumb_up_18.svg' : 'thumb_up_18@3x.png'
  const src = `${ExternalLinks.EMAIL_CDN}${icon}`
  const grid = useEmailItemGrid(reflections, 3)
  const commentLinkLabel =
    commentCount === 0
      ? 'No Comments'
      : commentCount >= 101
        ? 'See 100+ Comments'
        : `See ${commentCount} ${plural(commentCount, 'Comment')}`
  const commentLinkStyle = commentCount === 0 ? noCommentLinkStyle : someCommentsLinkStyle
  return (
    <>
      <tr>
        <td align='center' style={{paddingTop: 20}}>
          <AnchorIfEmail href={to} isDemo={isDemo} isEmail={isEmail} style={topicThemeHeading}>
            {title}
          </AnchorIfEmail>
        </td>
      </tr>
      <tr>
        <td align='center' style={votesBlock}>
          <AnchorIfEmail href={to} isDemo={isDemo} isEmail={isEmail}>
            <img crossOrigin='' height='18' src={src} width='18' style={imageStyle} />
          </AnchorIfEmail>
          <AnchorIfEmail href={to} isDemo={isDemo} isEmail={isEmail} style={voteCountStyle}>
            {voteCount}
          </AnchorIfEmail>
        </td>
      </tr>
      {!isDemo && (
        <tr>
          <td align='center'>
            <AnchorIfEmail href={to} isEmail={isEmail} style={commentLinkStyle}>
              {commentLinkLabel}
            </AnchorIfEmail>
          </td>
        </tr>
      )}
      <tr>
        <td>
          {grid((reflectionCard) => (
            <EmailReflectionCard reflection={reflectionCard} />
          ))}
        </td>
      </tr>
    </>
  )
}

export default createFragmentContainer(RetroTopic, {
  topic: graphql`
    fragment RetroTopic_topic on RetroReflectionGroup {
      commentCount
      title
      voteCount
      reflections {
        ...EmailReflectionCard_reflection
      }
    }
  `
})
