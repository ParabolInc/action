import styled, {css} from 'react-emotion'
import PropTypes from 'prop-types'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import withRouter from 'react-router-dom/es/withRouter'
import defaultStyles from 'universal/modules/notifications/helpers/styles'
import ApproveToOrgMutation from 'universal/mutations/ApproveToOrgMutation'
import ui from 'universal/styles/ui'
import {MONTHLY_PRICE, PRO} from 'universal/utils/constants'
import RejectOrgApprovalModal from '../RejectOrgApprovalModal/RejectOrgApprovalModal'
import Row from 'universal/components/Row/Row'
import IconAvatar from 'universal/components/IconAvatar/IconAvatar'
import RaisedButton from 'universal/components/RaisedButton'

const Button = styled(RaisedButton)({...ui.buttonBlockStyles})

const RequestNewUser = (props) => {
  const {
    atmosphere,
    notification,
    submitting,
    submitMutation,
    onError,
    onCompleted,
    history
  } = props
  const {
    notificationId,
    inviter: {inviterName},
    inviteeEmail,
    orgId,
    team
  } = notification
  const {teamName, teamId, tier} = team
  const acceptInvite = () => {
    submitMutation()
    ApproveToOrgMutation(atmosphere, inviteeEmail, orgId, onError, onCompleted)
  }

  const rejectToggle = <Button aria-label='Decline new user'>{'Decline'}</Button>

  const goToTeam = () => history.push(`/team/${teamId}`)

  return (
    <Row compact>
      <IconAvatar icon='user-circle-o' size='small' />
      <div className={css(defaultStyles.message)}>
        <b>{inviterName}</b>
        {' requested to add '}
        <b>{inviteeEmail}</b>
        {' to '}
        <span className={css(defaultStyles.messageVar, defaultStyles.notifLink)} onClick={goToTeam}>
          {teamName}
        </span>
        {'.'}
        <br />
        {tier === PRO && <span>{`Your monthly invoice will increase by $${MONTHLY_PRICE}.`}</span>}
      </div>
      <div className={css(defaultStyles.buttonGroup)}>
        <div className={css(defaultStyles.button)}>
          <Button
            aria-label='Accept new user'
            buttonSize={ui.notificationButtonSize}
            onClick={acceptInvite}
            palette='warm'
            waiting={submitting}
          >
            {'Accept'}
          </Button>
        </div>
        <div className={css(defaultStyles.button)}>
          <RejectOrgApprovalModal
            notificationId={notificationId}
            inviteeEmail={inviteeEmail}
            inviterName={inviterName}
            toggle={rejectToggle}
          />
        </div>
      </div>
    </Row>
  )
}

RequestNewUser.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  onCompleted: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  submitMutation: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  notification: PropTypes.object.isRequired
}

export default createFragmentContainer(
  withRouter(RequestNewUser),
  graphql`
    fragment RequestNewUser_notification on NotifyRequestNewUser {
      notificationId: id
      inviter {
        inviterName: preferredName
      }
      inviteeEmail
      orgId
      team {
        teamId: id
        teamName: name
        tier
      }
    }
  `
)
