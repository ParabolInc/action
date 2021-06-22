import {SuggestedActionTryRetroMeeting_suggestedAction} from '../__generated__/SuggestedActionTryRetroMeeting_suggestedAction.graphql'
import React, {Component} from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {RouteComponentProps, withRouter} from 'react-router'
import {PALETTE} from '../styles/paletteV3'
import SuggestedActionButton from './SuggestedActionButton'
import SuggestedActionCard from './SuggestedActionCard'
import SuggestedActionCopy from './SuggestedActionCopy'

interface Props extends RouteComponentProps<{}> {
  suggestedAction: SuggestedActionTryRetroMeeting_suggestedAction
}

class SuggestedActionTryRetroMeeting extends Component<Props> {
  onClick = () => {
    const {history, suggestedAction} = this.props
    const {team} = suggestedAction
    const {id: teamId} = team
    history.push(`/new-meeting/${teamId}`)
  }

  render() {
    const {suggestedAction} = this.props
    const {id: suggestedActionId, team} = suggestedAction
    const {name: teamName} = team
    return (
      <SuggestedActionCard
        backgroundColor={PALETTE.TOMATO_500}
        iconName='history'
        suggestedActionId={suggestedActionId}
      >
        <SuggestedActionCopy>Hold your first Retro Meeting with {teamName}</SuggestedActionCopy>
        <SuggestedActionButton onClick={this.onClick}>Start Retro Meeting</SuggestedActionButton>
      </SuggestedActionCard>
    )
  }
}

export default createFragmentContainer(withRouter(SuggestedActionTryRetroMeeting), {
  suggestedAction: graphql`
    fragment SuggestedActionTryRetroMeeting_suggestedAction on SuggestedActionTryRetroMeeting {
      id
      team {
        id
        name
      }
    }
  `
})
