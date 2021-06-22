import React, {Component} from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {RouteComponentProps, withRouter} from 'react-router'
import DismissSuggestedActionMutation from '../mutations/DismissSuggestedActionMutation'
import withAtmosphere, {WithAtmosphereProps} from '../decorators/withAtmosphere/withAtmosphere'
import {PALETTE} from '../styles/paletteV3'
import withMutationProps, {WithMutationProps} from '../utils/relay/withMutationProps'
import SuggestedActionButton from './SuggestedActionButton'
import SuggestedActionCard from './SuggestedActionCard'
import SuggestedActionCopy from './SuggestedActionCopy'
import {SuggestedActionTryTheDemo_suggestedAction} from '../__generated__/SuggestedActionTryTheDemo_suggestedAction.graphql'

interface Props extends WithAtmosphereProps, WithMutationProps, RouteComponentProps<{}> {
  suggestedAction: SuggestedActionTryTheDemo_suggestedAction
}

class SuggestedActionTryTheDemo extends Component<Props> {
  onClick = () => {
    const {
      atmosphere,
      history,
      submitting,
      submitMutation,
      suggestedAction,
      onError,
      onCompleted
    } = this.props
    const {id: suggestedActionId} = suggestedAction
    if (submitting) return
    submitMutation()
    DismissSuggestedActionMutation(atmosphere, {suggestedActionId}, {onError, onCompleted})
    history.push('/retrospective-demo')
  }

  render() {
    const {suggestedAction} = this.props
    const {id: suggestedActionId} = suggestedAction
    return (
      <SuggestedActionCard
        backgroundColor={PALETTE.GOLD_300}
        iconName='group_work'
        suggestedActionId={suggestedActionId}
      >
        <SuggestedActionCopy>
          Run a 2-minute demo retrospective with a scripted team
        </SuggestedActionCopy>
        <SuggestedActionButton onClick={this.onClick}>Try the Demo</SuggestedActionButton>
      </SuggestedActionCard>
    )
  }
}

export default createFragmentContainer(
  withAtmosphere(withMutationProps(withRouter(SuggestedActionTryTheDemo))),
  {
    suggestedAction: graphql`
      fragment SuggestedActionTryTheDemo_suggestedAction on SuggestedActionTryTheDemo {
        id
      }
    `
  }
)
