import {css} from 'react-emotion'
import PropTypes from 'prop-types'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {withRouter} from 'react-router-dom'
import AcknowledgeButton from 'universal/modules/notifications/components/AcknowledgeButton/AcknowledgeButton'
import defaultStyles from 'universal/modules/notifications/helpers/styles'
import ClearNotificationMutation from 'universal/mutations/ClearNotificationMutation'
import ui from 'universal/styles/ui'
import {clearNotificationLabel} from '../../helpers/constants'
import Row from 'universal/components/Row/Row'
import IconAvatar from 'universal/components/IconAvatar/IconAvatar'
import Button from 'universal/components/Button'

const PromoteToBillingLeader = (props) => {
  const {
    atmosphere,
    history,
    notification,
    submitting,
    submitMutation,
    onError,
    onCompleted
  } = props
  const {
    notificationId,
    organization: {orgName, orgId}
  } = notification
  const acknowledge = () => {
    submitMutation()
    ClearNotificationMutation(atmosphere, notificationId, onError, onCompleted)
  }
  const goToOrg = () => {
    submitMutation()
    ClearNotificationMutation(atmosphere, notificationId, onError, onCompleted)
    history.push(`/me/organizations/${orgId}`)
  }

  return (
    <Row compact>
      <div className={css(defaultStyles.icon)}>
        <IconAvatar icon='building' size='small' />
      </div>
      <div className={css(defaultStyles.message)}>
        {'You are now a '}
        <b>
          <i>{'Billing Leader'}</i>
        </b>
        {' for '}
        <span className={css(defaultStyles.messageVar, defaultStyles.notifLink)} onClick={goToOrg}>
          {orgName}
        </span>
        {'.'}
      </div>
      <div className={css(defaultStyles.widerButton)}>
        <Button
          aria-label='Go to the Organization page'
          colorPalette='warm'
          isBlock
          label='See Organization'
          buttonSize={ui.notificationButtonSize}
          type='submit'
          onClick={goToOrg}
          waiting={submitting}
        />
      </div>
      <div className={css(defaultStyles.iconButton)}>
        <AcknowledgeButton
          aria-label={clearNotificationLabel}
          onClick={acknowledge}
          waiting={submitting}
        />
      </div>
    </Row>
  )
}

PromoteToBillingLeader.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  onCompleted: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  submitMutation: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  notification: PropTypes.object.isRequired
}

export default createFragmentContainer(
  withRouter(PromoteToBillingLeader),
  graphql`
    fragment PromoteToBillingLeader_notification on NotifyPromoteToOrgLeader {
      notificationId: id
      organization {
        orgId: id
        orgName: name
      }
    }
  `
)
