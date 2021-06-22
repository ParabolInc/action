import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {Component} from 'react'
import {createFragmentContainer} from 'react-relay'
import withAtmosphere, {WithAtmosphereProps} from '../decorators/withAtmosphere/withAtmosphere'
import DismissNewFeatureMutation from '../mutations/DismissNewFeatureMutation'
import {DECELERATE, fadeIn} from '../styles/animation'
import {cardShadow} from '../styles/elevation'
import {PALETTE} from '../styles/paletteV3'
import gift from '../styles/theme/images/gift.svg'
import {ICON_SIZE} from '../styles/typographyV2'
import withMutationProps, {WithMutationProps} from '../utils/relay/withMutationProps'
import {TimelineNewFeature_viewer} from '../__generated__/TimelineNewFeature_viewer.graphql'
import Icon from './Icon'
import PlainButton from './PlainButton/PlainButton'

interface Props extends WithAtmosphereProps, WithMutationProps {
  viewer: TimelineNewFeature_viewer
}

const NewFeature = styled('div')({
  animation: `${fadeIn.toString()} 300ms ${DECELERATE}`,
  background: '#FFFFFF',
  borderRadius: 4,
  boxShadow: cardShadow,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  maxHeight: 200,
  position: 'relative'
})

const CancelIcon = styled(Icon)({
  color: PALETTE.SLATE_600,
  cursor: 'pointer',
  fontSize: ICON_SIZE.MD18,
  position: 'absolute',
  right: 8,
  top: 8,
  '&:hover': {
    opacity: 0.5
  }
})

const Header = styled('span')({
  display: 'flex',
  // with a line-height 20, this looks more centered than center
  alignItems: 'flex-end',
  padding: 16,
  paddingBottom: 0,
  fontWeight: 600
})

const HeaderText = styled('span')({
  lineHeight: '20px',
  paddingLeft: 8
})

const GiftIcon = styled(Icon)({
  background: `url(${gift})`,
  height: 24,
  width: 24
})

const Body = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  padding: 16
})

const LearnMore = styled('a')({
  color: PALETTE.SKY_500,
  paddingTop: 8,
  textAlign: 'right',
  ':hover,:focus,:active': {
    color: PALETTE.SKY_500,
    textDecoration: 'none'
  }
})

class TimelineNewFeature extends Component<Props> {
  onCancel = () => {
    const {atmosphere, onError, onCompleted, submitting, submitMutation} = this.props
    if (submitting) return
    submitMutation()
    DismissNewFeatureMutation(atmosphere, {}, {onCompleted, onError})
  }
  render() {
    const {viewer} = this.props
    const {newFeature} = viewer
    if (!newFeature) return null
    const {copy, url} = newFeature
    return (
      <NewFeature>
        <Header>
          <GiftIcon />
          <HeaderText>Latest Features</HeaderText>
        </Header>
        <Body>
          {copy}
          <LearnMore
            href={url}
            rel='noopener noreferrer'
            target='_blank'
            title='Latest Features Blog'
          >
            Learn more
          </LearnMore>
        </Body>
        <PlainButton onClick={this.onCancel}>
          <CancelIcon>close</CancelIcon>
        </PlainButton>
      </NewFeature>
    )
  }
}

export default createFragmentContainer(withAtmosphere(withMutationProps(TimelineNewFeature)), {
  viewer: graphql`
    fragment TimelineNewFeature_viewer on User {
      picture
      newFeature {
        copy
        url
      }
    }
  `
})
