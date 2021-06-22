import {SuggestedActionTryActionMeeting_suggestedAction} from '../__generated__/SuggestedActionTryActionMeeting_suggestedAction.graphql'
import React, {Component} from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {RouteComponentProps, withRouter} from 'react-router'
import {PALETTE} from '../styles/paletteV3'
import SuggestedActionButton from './SuggestedActionButton'
import SuggestedActionCard from './SuggestedActionCard'
import SuggestedActionCopy from './SuggestedActionCopy'

interface Props extends RouteComponentProps<{}> {
  suggestedAction: SuggestedActionTryActionMeeting_suggestedAction
}

class SuggestedActionTryActionMeeting extends Component<Props> {
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
        backgroundColor={PALETTE.AQUA_400}
        iconName='change_history'
        suggestedActionId={suggestedActionId}
      >
        <SuggestedActionCopy>Hold your first Check-in Meeting with {teamName}</SuggestedActionCopy>
        <SuggestedActionButton onClick={this.onClick}>Start Check-in Meeting</SuggestedActionButton>
      </SuggestedActionCard>
    )
  }
}

export default createFragmentContainer(withRouter(SuggestedActionTryActionMeeting), {
  suggestedAction: graphql`
    fragment SuggestedActionTryActionMeeting_suggestedAction on SuggestedActionTryActionMeeting {
      id
      team {
        id
        name
      }
    }
  `
})
