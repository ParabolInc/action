import {SuggestedActionCreateNewTeam_suggestedAction} from '../__generated__/SuggestedActionCreateNewTeam_suggestedAction.graphql'
import React, {Component} from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {RouteComponentProps, withRouter} from 'react-router'
import withAtmosphere, {WithAtmosphereProps} from '../decorators/withAtmosphere/withAtmosphere'
import {PALETTE} from '../styles/paletteV3'
import withMutationProps, {WithMutationProps} from '../utils/relay/withMutationProps'
import SuggestedActionButton from './SuggestedActionButton'
import SuggestedActionCard from './SuggestedActionCard'
import SuggestedActionCopy from './SuggestedActionCopy'

interface Props extends WithAtmosphereProps, WithMutationProps, RouteComponentProps<{}> {
  suggestedAction: SuggestedActionCreateNewTeam_suggestedAction
}

class SuggestedActionCreateNewTeam extends Component<Props> {
  onClick = () => {
    const {history} = this.props
    history.push('/newteam')
  }

  render() {
    const {suggestedAction} = this.props
    const {id: suggestedActionId} = suggestedAction
    return (
      <SuggestedActionCard
        backgroundColor={PALETTE.JADE_400}
        iconName='group_add'
        suggestedActionId={suggestedActionId}
      >
        <SuggestedActionCopy>
          Create a new team to collaborate with other groups
        </SuggestedActionCopy>
        <SuggestedActionButton onClick={this.onClick}>Create New Team</SuggestedActionButton>
      </SuggestedActionCard>
    )
  }
}

export default createFragmentContainer(
  withAtmosphere(withMutationProps(withRouter(SuggestedActionCreateNewTeam))),
  {
    suggestedAction: graphql`
      fragment SuggestedActionCreateNewTeam_suggestedAction on SuggestedActionCreateNewTeam {
        id
      }
    `
  }
)
