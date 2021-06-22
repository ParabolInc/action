import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import ArchiveOrganization from '~/modules/teamDashboard/components/ArchiveTeam/ArchiveOrganization'
import {OrgBillingDangerZone_organization} from '~/__generated__/OrgBillingDangerZone_organization.graphql'
import Icon from '../../../../components/Icon'
import Panel from '../../../../components/Panel/Panel'
import {PALETTE} from '../../../../styles/paletteV3'
import {ICON_SIZE} from '../../../../styles/typographyV2'
import {Layout} from '../../../../types/constEnums'

const EnvelopeIcon = styled(Icon)({
  fontSize: ICON_SIZE.MD18,
  marginLeft: 4
})

const PanelRow = styled('div')({
  borderTop: `1px solid ${PALETTE.SLATE_300}`,
  padding: Layout.ROW_GUTTER,
  textAlign: 'center'
})

const Unsubscribe = styled('div')({
  alignItems: 'center',
  color: PALETTE.SLATE_700,
  display: 'flex',
  justifyContent: 'center',
  '& a': {
    alignItems: 'center',
    color: PALETTE.SKY_500,
    display: 'flex',
    marginLeft: 8,
    '& > u': {
      textDecoration: 'none'
    },
    '&:hover > u, &:focus > u': {
      textDecoration: 'underline'
    }
  }
})

interface Props {
  organization: OrgBillingDangerZone_organization
}
const OrgBillingDangerZone = (props: Props) => {
  const {organization} = props
  const {isBillingLeader, tier} = organization
  if (!isBillingLeader) return null
  const isPersonal = tier === 'personal'
  return (
    <Panel label='Danger Zone'>
      <PanelRow>
        {isPersonal ? (
          <ArchiveOrganization organization={organization} />
        ) : (
          <Unsubscribe>
            <span>{'Need to cancel? It’s painless. '}</span>
            <a
              href='mailto:love@parabol.co?subject=Instant Unsubscribe from Pro'
              title='Instant Unsubscribe from Pro'
            >
              <u>{'Contact us'}</u>
              <EnvelopeIcon>email</EnvelopeIcon>
            </a>
          </Unsubscribe>
        )}
      </PanelRow>
    </Panel>
  )
}

export default createFragmentContainer(OrgBillingDangerZone, {
  organization: graphql`
    fragment OrgBillingDangerZone_organization on Organization {
      ...ArchiveOrganization_organization
      isBillingLeader
      tier
    }
  `
})
