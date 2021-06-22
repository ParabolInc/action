import React from 'react'
import styled from '@emotion/styled'
import TagBlock from '../../../../components/Tag/TagBlock'
import makeDateString from '../../../../utils/makeDateString'
import {TierEnum} from '~/__generated__/StandardHub_viewer.graphql'
import TierTag from '../../../../components/Tag/TierTag'

const StyledTagBlock = styled(TagBlock)({
  display: 'block'
})

const OrgDetails = styled('div')({
  alignItems: 'flex-start',
  display: 'flex',
  flexShrink: 0,
  fontSize: 13,
  lineHeight: '20px'
})

interface Props {
  createdAt: string
  tier: TierEnum
}

const OrganizationDetails = (props: Props) => {
  const {createdAt, tier} = props
  return (
    <OrgDetails>
      {'Created '}
      {makeDateString(createdAt)}
      {tier !== 'personal' && (
        <StyledTagBlock>
          <TierTag tier={tier} />
        </StyledTagBlock>
      )}
    </OrgDetails>
  )
}

export default OrganizationDetails
