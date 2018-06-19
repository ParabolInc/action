import styled, {css} from 'react-emotion'
import PropTypes from 'prop-types'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {withRouter} from 'react-router-dom'
import defaultStyles from 'universal/modules/notifications/helpers/styles'
import ui from 'universal/styles/ui'
import Row from 'universal/components/Row/Row'
import IconAvatar from 'universal/components/IconAvatar/IconAvatar'
import RaisedButton from 'universal/components/RaisedButton'

const StyledButton = styled(RaisedButton)({...ui.buttonBlockStyles})

const PaymentRejected = (props) => {
  const {history, notification} = props
  const {
    organization: {
      orgId,
      creditCard: {last4, brand}
    }
  } = notification
  const addBilling = () => {
    history.push(`/me/organizations/${orgId}`)
  }
  return (
    <Row compact>
      <IconAvatar icon='credit-card' size='small' />
      <div className={css(defaultStyles.message)}>
        {'Your '}
        <b>{brand}</b>
        {' card ending in '}
        <b>{last4}</b>
        {' was rejected.'}
        <br />
        {'Call your card provider or head to the settings page to try a new card.'}
      </div>
      <div className={css(defaultStyles.widestButton)}>
        <StyledButton
          aria-label='Go to the billing page to update billing information'
          buttonSize={ui.notificationButtonSize}
          onClick={addBilling}
          palette='warm'
        >
          {'See Billing'}
        </StyledButton>
      </div>
    </Row>
  )
}

PaymentRejected.propTypes = {
  history: PropTypes.object.isRequired,
  notification: PropTypes.object.isRequired
}

export default createFragmentContainer(
  withRouter(PaymentRejected),
  graphql`
    fragment PaymentRejected_notification on NotifyPaymentRejected {
      notificationId: id
      organization {
        orgId: id
        creditCard {
          last4
          brand
        }
      }
    }
  `
)
