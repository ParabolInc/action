import styled from '@emotion/styled'
import React from 'react'
import Menu from '~/components/Menu'
import MenuItem from '~/components/MenuItem'
import useAtmosphere from '~/hooks/useAtmosphere'
import {MenuProps} from '~/hooks/useMenu'
import ArchiveTimelineEventMutation from '~/mutations/ArchiveTimelineEventMutation'
import {PALETTE} from '~/styles/paletteV3'
import {ICON_SIZE} from '~/styles/typographyV2'
import Icon from './Icon'
import {MenuItemLabelStyle} from './MenuItemLabel'

interface Props {
  menuProps: MenuProps
  timelineEventId: string
}

const StyledIcon = styled(Icon)({
  color: PALETTE.SLATE_600,
  fontSize: ICON_SIZE.MD24,
  marginRight: 8
})

const TimelineEventMenuItemLabel = styled('div')({
  ...MenuItemLabelStyle,
  width: '200px'
})

const TimelineEventHeaderMenu = (props: Props) => {
  const {menuProps, timelineEventId} = props
  const atmosphere = useAtmosphere()
  return (
    <Menu ariaLabel={'Change the status of the timeline event'} {...menuProps}>
      <MenuItem
        key='archive'
        label={
          <TimelineEventMenuItemLabel>
            <StyledIcon>archive</StyledIcon>
            <span>{'Archive meeting'}</span>
          </TimelineEventMenuItemLabel>
        }
        onClick={() => ArchiveTimelineEventMutation(atmosphere, {timelineEventId})}
      />
    </Menu>
  )
}

export default TimelineEventHeaderMenu
