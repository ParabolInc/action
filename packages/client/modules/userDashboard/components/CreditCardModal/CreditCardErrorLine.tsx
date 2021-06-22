import StripeClientManager from '../../../../utils/StripeClientManager'
import React, {useEffect, useState} from 'react'
import CreditCardIcon from '../../../../components/CreditCardIcon'
import styled from '@emotion/styled'
import {PALETTE} from '../../../../styles/paletteV3'
import Icon from '../../../../components/Icon'
import {ICON_SIZE} from '../../../../styles/typographyV2'
import {UseFormField} from '../../../../hooks/useForm'

const LineIcon = styled(Icon)({
  fontSize: ICON_SIZE.MD18,
  lineHeight: '20px'
})

interface Props {
  serverError?: string
  fields: {
    creditCardNumber: UseFormField
    expiry: UseFormField
    cvc: UseFormField
  }
  stripeClientManager: StripeClientManager
}

const Line = styled('div')({
  alignItems: 'center',
  color: PALETTE.SLATE_600,
  display: 'flex',
  padding: '8px 24px'
})

const Error = styled('div')<{isError: boolean}>(({isError}) => ({
  alignItems: 'center',
  color: isError ? PALETTE.TOMATO_500 : PALETTE.SLATE_600,
  display: 'flex',
  flex: 1,
  lineHeight: '24px',
  minHeight: 24
}))

const Message = styled('div')({
  fontSize: 15,
  paddingLeft: 4
})

const CreditCardErrorLine = (props: Props) => {
  const {fields, serverError, stripeClientManager} = props
  const [cardTypeIcon, setCardTypeIcon] = useState<string>()
  const {creditCardNumber, cvc, expiry} = fields
  const primaryError =
    serverError ||
    (creditCardNumber.dirty && creditCardNumber.error) ||
    (expiry.dirty && expiry.error) ||
    (cvc.dirty && cvc.error)
  useEffect(() => {
    const icon = stripeClientManager.cardTypeIcon(creditCardNumber.value)
    setCardTypeIcon(icon)
  }, [creditCardNumber.value])
  return (
    <Line>
      <Error isError={!!primaryError}>
        <LineIcon>{primaryError ? 'error' : 'lock'}</LineIcon>
        <Message>
          {primaryError || (
            <>
              {'Secured by '}
              <b>Stripe</b>
            </>
          )}
        </Message>
      </Error>
      {cardTypeIcon ? <CreditCardIcon cardTypeIcon={cardTypeIcon} /> : null}
    </Line>
  )
}

export default CreditCardErrorLine
