import SecondaryButton from '../../../../components/SecondaryButton'
import Panel from '../../../../components/Panel/Panel'
import React from 'react'
import styled from '@emotion/styled'
import {PALETTE} from '../../../../styles/paletteV3'
import Icon from '../../../../components/Icon'
import {ICON_SIZE} from '../../../../styles/typographyV2'
import {Breakpoint, Layout} from '../../../../types/constEnums'
import graphql from 'babel-plugin-relay/macro'
import {OrgBillingCreditCardInfo_organization} from '~/__generated__/OrgBillingCreditCardInfo_organization.graphql'
import {createFragmentContainer} from 'react-relay'
import useModal from '../../../../hooks/useModal'
import lazyPreload from '../../../../utils/lazyPreload'

const CreditCardInfo = styled('div')({
  alignItems: 'center',
  color: PALETTE.SLATE_700,
  display: 'flex',
  fontSize: 14,
  lineHeight: '20px'
})

const CreditCardIcon = styled(Icon)({
  color: PALETTE.SLATE_600,
  fontSize: ICON_SIZE.MD24,
  marginRight: 16
})

const CreditCardProvider = styled('span')({
  fontWeight: 600,
  marginRight: 8
})

const CreditCardNumber = styled('span')({
  marginRight: 32
})

const CreditCardExpiresLabel = styled('span')({
  fontWeight: 600,
  marginRight: 8
})

const InfoAndUpdate = styled('div')({
  borderTop: `1px solid ${PALETTE.SLATE_300}`,
  padding: Layout.ROW_GUTTER,
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'space-between'
})

const InfoBlocks = styled('div')({
  [`@media screen and (min-width: ${Breakpoint.SIDEBAR_LEFT}px)`]: {
    alignItems: 'center',
    display: 'flex'
  }
})

const CreditCardModal = lazyPreload(() =>
  import(
    /* webpackChunkName: 'CreditCardModal' */
    '../CreditCardModal/CreditCardModal'
  )
)

interface Props {
  organization: OrgBillingCreditCardInfo_organization
}

const OrgBillingCreditCardInfo = (props: Props) => {
  const {organization} = props
  const {creditCard, id: orgId, orgUserCount} = organization
  const {modalPortal, closePortal, togglePortal} = useModal()
  if (!creditCard) return null
  const {activeUserCount} = orgUserCount
  const {brand, last4, expiry} = creditCard
  return (
    <Panel label='Credit Card Information'>
      <InfoAndUpdate>
        <CreditCardInfo>
          <CreditCardIcon>credit_card</CreditCardIcon>
          <InfoBlocks>
            <div>
              <CreditCardProvider>{brand}</CreditCardProvider>
              <CreditCardNumber>
                {'•••• •••• •••• '}
                {last4}
              </CreditCardNumber>
            </div>
            <div>
              <CreditCardExpiresLabel>{'Expires'}</CreditCardExpiresLabel>
              <span>{expiry}</span>
            </div>
          </InfoBlocks>
        </CreditCardInfo>
        <SecondaryButton onClick={togglePortal} onMouseEnter={CreditCardModal.preload}>
          {'Update'}
        </SecondaryButton>
        {modalPortal(
          <CreditCardModal
            activeUserCount={activeUserCount}
            orgId={orgId}
            actionType={'update'}
            closePortal={closePortal}
          />
        )}
      </InfoAndUpdate>
    </Panel>
  )
}

export default createFragmentContainer(OrgBillingCreditCardInfo, {
  organization: graphql`
    fragment OrgBillingCreditCardInfo_organization on Organization {
      id
      orgUserCount {
        activeUserCount
      }
      creditCard {
        brand
        expiry
        last4
      }
    }
  `
})
