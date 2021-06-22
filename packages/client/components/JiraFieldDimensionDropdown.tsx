import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {PALETTE} from '~/styles/paletteV3'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import {ICON_SIZE} from '../styles/typographyV2'
import {SprintPokerDefaults} from '../types/constEnums'
import lazyPreload from '../utils/lazyPreload'
import {JiraFieldDimensionDropdown_stage} from '../__generated__/JiraFieldDimensionDropdown_stage.graphql'
import Icon from './Icon'
import PlainButton from './PlainButton/PlainButton'

const JiraFieldMenuRoot = lazyPreload(async () =>
  import(/* webpackChunkName: 'JiraFieldMenuRoot' */ './JiraFieldMenuRoot')
)

interface Props {
  clearError: () => void
  isFacilitator: boolean
  stage: JiraFieldDimensionDropdown_stage

}

const Wrapper = styled(PlainButton)<{isFacilitator: boolean}>(({isFacilitator}) => ({
  color: PALETTE.SLATE_700,
  cursor: isFacilitator ? undefined : 'default',
  display: 'flex',
  paddingRight: isFacilitator ? undefined : 8,
  userSelect: 'none',
  ':hover,:focus,:active': {
    opacity: isFacilitator ? '50%' : undefined
  }
}))

const CurrentValue = styled('div')({
  fontSize: 14
})

const StyledIcon = styled(Icon)<{isFacilitator: boolean}>(({isFacilitator}) => ({
  fontSize: ICON_SIZE.MD18,
  display: isFacilitator ? undefined : 'none'
}))

const labelLookup = {
  [SprintPokerDefaults.JIRA_FIELD_COMMENT]: SprintPokerDefaults.JIRA_FIELD_COMMENT_LABEL,
  [SprintPokerDefaults.JIRA_FIELD_NULL]: SprintPokerDefaults.JIRA_FIELD_NULL_LABEL,
}

const JiraFieldDimensionDropdown = (props: Props) => {
  const {clearError, stage, isFacilitator} = props
  const {serviceField} = stage
  const {name: serviceFieldName} = serviceField
  const {togglePortal, menuPortal, originRef, menuProps} = useMenu<HTMLButtonElement>(
    MenuPosition.UPPER_RIGHT,
    {
      isDropdown: true
    }
  )

  const onClick = () => {
    if (!isFacilitator) return
    togglePortal()
    clearError()
  }

  const label = labelLookup[serviceFieldName] || serviceFieldName
  return (
    <Wrapper onMouseEnter={JiraFieldMenuRoot.preload} isFacilitator={isFacilitator}
      onClick={onClick}
      ref={originRef}>
      <CurrentValue>{label}</CurrentValue>
      <StyledIcon isFacilitator={isFacilitator}>{'expand_more'}</StyledIcon>
      {menuPortal(
        <JiraFieldMenuRoot menuProps={menuProps} stage={stage} />
      )}
    </Wrapper>
  )
}

export default createFragmentContainer(JiraFieldDimensionDropdown,
  {
    stage: graphql`
    fragment JiraFieldDimensionDropdown_stage on EstimateStage {
      ...JiraFieldMenuRoot_stage
      serviceField {
        name
      }
    }
    `
  }
)
