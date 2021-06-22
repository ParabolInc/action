import React from 'react'
import {TierLabel} from '../../types/constEnums'
import {TierEnum} from '../../__generated__/NewMeeting_viewer.graphql'
import styled from '@emotion/styled'
import {PALETTE} from '../../styles/paletteV3'
import BaseTag from './BaseTag'

interface Props {
  className?: string
  tier: TierEnum | null
}

const PersonalTag = styled(BaseTag)({
  backgroundColor: PALETTE.SLATE_200,
  color: PALETTE.SLATE_700
})

const ProTag = styled(BaseTag)({
  backgroundColor: PALETTE.GOLD_300,
  color: PALETTE.GRAPE_700
})

const EnterpriseTag = styled(BaseTag)({
  backgroundColor: PALETTE.SKY_500,
  color: '#FFFFFF'
})

const TierTag = (props: Props) => {
  const {className, tier} = props
  if (tier === 'personal')
    return <PersonalTag className={className}>{TierLabel.PERSONAL}</PersonalTag>
  if (tier === 'pro') return <ProTag className={className}>{TierLabel.PRO}</ProTag>
  if (tier === 'enterprise')
    return <EnterpriseTag className={className}>{TierLabel.ENTERPRISE}</EnterpriseTag>
  return null
}
export default TierTag
