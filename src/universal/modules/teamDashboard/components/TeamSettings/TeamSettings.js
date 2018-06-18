import PropTypes from 'prop-types'
import React, {Component} from 'react'
import {withRouter} from 'react-router-dom'
import {connect} from 'react-redux'
import {createFragmentContainer} from 'react-relay'
import InviteUser from 'universal/components/InviteUser/InviteUser'
import Helmet from 'react-helmet'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import LeaveTeamModal from 'universal/modules/teamDashboard/components/LeaveTeamModal/LeaveTeamModal'
import PromoteTeamMemberModal from 'universal/modules/teamDashboard/components/PromoteTeamMemberModal/PromoteTeamMemberModal'
import RemoveTeamMemberModal from 'universal/modules/teamDashboard/components/RemoveTeamMemberModal/RemoveTeamMemberModal'
import ArchiveTeamContainer from 'universal/modules/teamDashboard/containers/ArchiveTeamContainer/ArchiveTeamContainer'
import {showSuccess} from 'universal/modules/toast/ducks/toastDuck'
import CancelApprovalMutation from 'universal/mutations/CancelApprovalMutation'
import CancelTeamInviteMutation from 'universal/mutations/CancelTeamInviteMutation'
import ResendTeamInviteMutation from 'universal/mutations/ResendTeamInviteMutation'
import appTheme from 'universal/styles/theme/appTheme'
import ui from 'universal/styles/ui'
import withMutationProps from 'universal/utils/relay/withMutationProps'
import StyledFontAwesome from 'universal/components/StyledFontAwesome'
import styled from 'react-emotion'
import {PERSONAL, PRO_LABEL} from 'universal/utils/constants'
import Tooltip from 'universal/components/Tooltip/Tooltip'
import Panel from 'universal/components/Panel/Panel'
import Row from 'universal/components/Row/Row'
import PrimaryButton from 'universal/components/PrimaryButton'
import UserRow from 'universal/components/UserRow/UserRow'

const originAnchor = {
  vertical: 'center',
  horizontal: 'right'
}

const targetAnchor = {
  vertical: 'center',
  horizontal: 'left'
}

const TooltipIcon = styled(StyledFontAwesome)({
  color: appTheme.palette.dark70a,
  fontSize: ui.iconSize,
  lineHeight: '1.25rem',
  verticalAlign: 'middle',
  marginLeft: '.25rem',
  marginTop: '-.0625rem'
})

const TeamSettingsLayout = styled('div')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  width: '100%'
})

const PanelsLayout = styled('div')({
  margin: '0 auto',
  maxWidth: ui.settingsPanelMaxWidth,
  width: '100%'
})

const ActionsBlock = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',
  fontSize: 0,
  textAlign: 'right'
})

const ActionLink = styled('div')({
  color: appTheme.palette.dark,
  cursor: 'pointer',
  display: 'inline-block',
  fontSize: appTheme.typography.s3,
  fontWeight: 600,
  lineHeight: appTheme.typography.s5,
  marginLeft: '1.25rem',
  verticalAlign: 'middle',

  ':hover': {
    opacity: '.5'
  }
})

const PanelInner = styled('div')({
  borderTop: `.0625rem solid ${ui.panelInnerBorderColor}`
})

const PanelRow = styled('div')({
  borderTop: `.0625rem solid ${ui.rowBorderColor}`,
  padding: `${ui.panelGutter}`
})

class TeamSettings extends Component {
  static propTypes = {
    atmosphere: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    viewer: PropTypes.object.isRequired,
    submitting: PropTypes.bool,
    submitMutation: PropTypes.func.isRequired,
    onCompleted: PropTypes.func.isRequired,
    onError: PropTypes.func.isRequired
  }
  teamMemberRowActions = (teamMember) => {
    const {
      viewer: {team}
    } = this.props
    const {teamMembers} = team
    const viewerTeamMember = teamMembers.find((m) => m.isSelf)
    const {teamMemberId, preferredName} = teamMember
    const {isLead: viewerIsLead, teamMemberId: myTeamMemberId} = viewerTeamMember
    return (
      <ActionsBlock>
        {viewerIsLead &&
          myTeamMemberId !== teamMemberId && (
            <PromoteTeamMemberModal
              toggle={<ActionLink>{`Promote ${preferredName} to Team Lead`}</ActionLink>}
              teamMember={teamMember}
            />
          )}
        {viewerIsLead &&
          myTeamMemberId !== teamMemberId && (
            <RemoveTeamMemberModal
              toggle={<ActionLink>{'Remove'}</ActionLink>}
              teamMember={teamMember}
            />
          )}
        {!viewerIsLead &&
          myTeamMemberId === teamMemberId && (
            <LeaveTeamModal
              toggle={<ActionLink>{'Leave Team'}</ActionLink>}
              team={team}
              teamMember={teamMember}
            />
          )}
      </ActionsBlock>
    )
  }
  orgApprovalRowActions = (orgApprovalId) => {
    const {atmosphere, submitMutation, submitting, onCompleted, onError} = this.props

    const cancel = () => {
      if (submitting) return
      submitMutation()
      CancelApprovalMutation(atmosphere, orgApprovalId, onError, onCompleted)
    }
    const tip = <div>{'Waiting for the organization billing leader to approve.'}</div>
    return (
      <ActionsBlock>
        <ActionLink onClick={cancel}>{'Cancel Pending Approval'}</ActionLink>
        <span>
          <Tooltip
            delay={200}
            maxHeight={40}
            maxWidth={500}
            originAnchor={originAnchor}
            targetAnchor={targetAnchor}
            tip={tip}
          >
            <TooltipIcon name='question-circle' />
          </Tooltip>
        </span>
      </ActionsBlock>
    )
  }

  invitationRowActions (invitationId) {
    const {
      atmosphere,
      dispatch,
      submitMutation,
      onCompleted,
      onError,
      viewer: {
        team: {teamId}
      }
    } = this.props

    const resend = () => {
      submitMutation()
      const onResendCompleted = () => {
        dispatch(
          showSuccess({
            title: 'Invitation sent!',
            message: 'We sent your friend a nice little reminder'
          })
        )
        onCompleted()
      }
      ResendTeamInviteMutation(atmosphere, invitationId, onError, onResendCompleted)
    }
    const cancel = () => {
      submitMutation()
      CancelTeamInviteMutation(atmosphere, invitationId, teamId, onError, onCompleted)
    }
    return (
      <ActionsBlock>
        <ActionLink onClick={resend}>{'Resend Invitation'}</ActionLink>
        <ActionLink onClick={cancel}>{'Cancel Invitation'}</ActionLink>
      </ActionsBlock>
    )
  }

  render () {
    const {
      dispatch,
      history,
      viewer: {team}
    } = this.props
    const {invitations, orgApprovals, orgId, teamName, teamMembers, tier} = team
    const viewerTeamMember = teamMembers.find((m) => m.isSelf)
    // if kicked out, the component might reload before the redirect occurs
    if (!viewerTeamMember) return null
    const {isLead: viewerIsLead} = viewerTeamMember

    return (
      <TeamSettingsLayout>
        <Helmet title={`Team Settings | ${teamName}`} />
        <PanelsLayout>
          {tier === PERSONAL && (
            <Panel>
              <Row>
                <div>{'This team is currently on a personal plan.'}</div>
                <PrimaryButton onClick={() => history.push(`/me/organizations/${orgId}`)}>
                  {'Upgrade Team to '}
                  <b>{PRO_LABEL}</b>
                </PrimaryButton>
              </Row>
            </Panel>
          )}
          <Panel label='Manage Team'>
            <PanelInner>
              <InviteUser dispatch={dispatch} team={team} />
              {teamMembers.map((teamMember) => {
                const {teamMemberId} = teamMember
                return (
                  <UserRow
                    key={`teamMemberKey${teamMemberId}`}
                    actions={this.teamMemberRowActions(teamMember)}
                    possibleTeamMember={teamMember}
                  />
                )
              })}
              {invitations.map((invitation) => {
                const {invitationId} = invitation
                return (
                  <UserRow
                    key={`invitationKey${invitationId}`}
                    actions={this.invitationRowActions(invitationId)}
                    possibleTeamMember={invitation}
                  />
                )
              })}
              {orgApprovals.map((orgApproval) => {
                const {orgApprovalId} = orgApproval
                return (
                  <UserRow
                    key={`approval${orgApprovalId}`}
                    actions={this.orgApprovalRowActions(orgApprovalId)}
                    possibleTeamMember={orgApproval}
                  />
                )
              })}
            </PanelInner>
          </Panel>
          {viewerIsLead && (
            <Panel label='Danger Zone'>
              <PanelRow>
                <ArchiveTeamContainer team={team} />
              </PanelRow>
            </Panel>
          )}
        </PanelsLayout>
      </TeamSettingsLayout>
    )
  }
}

export default createFragmentContainer(
  withAtmosphere(withMutationProps(withRouter(connect()(TeamSettings)))),
  graphql`
    fragment TeamSettings_viewer on User {
      team(teamId: $teamId) {
        ...InviteUser_team
        ...LeaveTeamModal_team
        ...ArchiveTeamContainer_team
        teamId: id
        teamName: name
        tier
        orgId
        teamMembers(sortBy: "preferredName") {
          ...PromoteTeamMemberModal_teamMember
          ...RemoveTeamMemberModal_teamMember
          ...LeaveTeamModal_teamMember
          ...UserRow_possibleTeamMember
          teamMemberId: id
          isLead
          isSelf
          preferredName
        }
        invitations {
          ...UserRow_possibleTeamMember
          invitationId: id
        }
        orgApprovals {
          ...UserRow_possibleTeamMember
          orgApprovalId: id
        }
      }
    }
  `
)
