import React, {Component, ReactNode} from 'react'
import styled from '@emotion/styled'
import Icon from './Icon'
import PlainButton from './PlainButton/PlainButton'
import DismissSuggestedActionMutation from '../mutations/DismissSuggestedActionMutation'
import {buttonShadow, cardShadow} from '../styles/elevation'
import withAtmosphere, {WithAtmosphereProps} from '../decorators/withAtmosphere/withAtmosphere'
import {DECELERATE, fadeIn} from '../styles/animation'
import {PALETTE} from '../styles/paletteV3'
import {ICON_SIZE} from '../styles/typographyV2'
import withMutationProps, {WithMutationProps} from '../utils/relay/withMutationProps'
import SuggestedActionBackground from './SuggestedActionBackground'

interface Props extends WithAtmosphereProps, WithMutationProps {
  backgroundColor: string
  children: ReactNode
  iconName: string
  suggestedActionId: string
}

const Surface = styled('div')({
  animation: `${fadeIn.toString()} 300ms ${DECELERATE}`,
  alignItems: 'center',
  background: '#FFFFFF',
  borderRadius: 4,
  boxShadow: cardShadow,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  position: 'relative',
  width: '100%'
})

const CancelIcon = styled(Icon)({
  background: `rgba(255,255,255,0.8)`,
  borderRadius: '100%',
  color: PALETTE.SLATE_700,
  position: 'absolute',
  right: 8,
  top: 8,
  opacity: 0.7,
  '&:hover': {
    opacity: 1
  }
})

const FloatingSealIcon = styled(Icon)({
  color: PALETTE.GRAPE_700,
  background: PALETTE.SLATE_300,
  borderRadius: '100%',
  boxShadow: buttonShadow,
  padding: 8,
  position: 'absolute',
  fontSize: ICON_SIZE.MD36,
  top: 100,
  userSelect: 'none'
})

class SuggestedActionCard extends Component<Props> {
  onCancel = () => {
    const {
      atmosphere,
      submitting,
      submitMutation,
      suggestedActionId,
      onCompleted,
      onError
    } = this.props
    if (submitting) return
    submitMutation()
    DismissSuggestedActionMutation(atmosphere, {suggestedActionId}, {onError, onCompleted})
  }

  render() {
    const {backgroundColor, children, iconName} = this.props
    return (
      <Surface>
        <SuggestedActionBackground backgroundColor={backgroundColor} />
        {children}
        <PlainButton onClick={this.onCancel}>
          <CancelIcon>cancel</CancelIcon>
        </PlainButton>
        <FloatingSealIcon>{iconName}</FloatingSealIcon>
      </Surface>
    )
  }
}

export default withMutationProps(withAtmosphere(SuggestedActionCard))
