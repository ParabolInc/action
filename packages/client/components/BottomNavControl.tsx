import styled from '@emotion/styled'
import {TransitionStatus} from '~/hooks/useTransition'
import {BezierCurve, ElementWidth} from '~/types/constEnums'
import FlatButton, {FlatButtonProps} from './FlatButton'
import {PALETTE} from '../styles/paletteV3'

interface Props extends FlatButtonProps {
  confirming?: boolean
  disabled?: boolean
  status: TransitionStatus
  waiting?: boolean
}

const BottomNavControl = styled(FlatButton)<Props>((props) => {
  const {confirming, disabled, status, waiting} = props
  const visuallyDisabled = disabled || waiting
  return {
    border: 0,
    borderRadius: 0,
    minHeight: 56,
    width: status === TransitionStatus.MOUNTED || status === TransitionStatus.EXITING ? 0 : ElementWidth.CONTROL_BAR_BUTTON,
    opacity: confirming
      ? 0.5
      : status === TransitionStatus.MOUNTED || status === TransitionStatus.EXITING
        ? 0
        : 1,
    padding: 0,
    transformOrigin: 'center bottom',
    transition: `all 300ms ${BezierCurve.DECELERATE}`,
    ':hover,:focus,:active': {
      backgroundColor: !visuallyDisabled ? PALETTE.SLATE_100 : undefined
    }
  }
})

export default BottomNavControl
