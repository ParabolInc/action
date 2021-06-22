import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useTooltip from '~/hooks/useTooltip'
import BaseButton from '../../../../components/BaseButton'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import {UseTaskChild} from '../../../../hooks/useTaskChildFocus'
import textOverflow from '../../../../styles/helpers/textOverflow'
import {PALETTE} from '../../../../styles/paletteV3'
import avatarUser from '../../../../styles/theme/images/avatar-user.svg'
import lazyPreload from '../../../../utils/lazyPreload'
import {TaskFooterUserAssignee_task} from '../../../../__generated__/TaskFooterUserAssignee_task.graphql'
import Icon from '../../../../components/Icon'

const label = {
  ...textOverflow,
  color: PALETTE.SLATE_700,
  display: 'block',
  flex: 1,
  fontSize: 12,
  fontWeight: 400,
  lineHeight: '24px',
  maxWidth: '100%',
  textAlign: 'left'
} as const

const AvatarButton = styled(BaseButton)({
  border: 0,
  boxShadow: 'none',
  display: 'flex',
  fontSize: 'inherit',
  height: 24,
  lineHeight: 'inherit',
  outline: 0,
  padding: 0,
  maxWidth: '100%',
  ':hover,:focus,:active': {
    boxShadow: 'none'
  },
  ':hover > div,:focus > div': {
    borderColor: PALETTE.SLATE_700,
    color: PALETTE.SLATE_700
  }
})

const Avatar = styled('div')<{cardIsActive: boolean; isAssigned: boolean}>(
  ({cardIsActive, isAssigned}) => ({
    backgroundColor: isAssigned ? 'transparent' : PALETTE.SLATE_600,
    color: isAssigned ? 'transparent' : undefined,
    border: '1px solid transparent',
    borderColor: cardIsActive ? PALETTE.SLATE_500 : undefined,
    borderRadius: '100%',
    height: 28,
    marginLeft: -2,
    marginRight: 4,
    padding: 1,
    position: 'relative',
    top: -2,
    width: 28
  })
)

const AvatarImage = styled('img')({
  borderRadius: '100%',
  height: 24,
  marginRight: 4,
  width: 24
})

const AvatarLabel = styled('div')({
  ...label,
  color: PALETTE.SLATE_600,
  flex: 1,
  minWidth: 0
})

const TooltipToggle = styled('div')({
  display: 'inline-flex'
})

const StyledIcon = styled(Icon)({
  alignContent: 'center',
  alignItems: 'center',
  color: PALETTE.WHITE,
  cursor: 'pointer',
  display: 'flex',
  fontSize: 22,
  justifyContent: 'center',
  position: 'relative',
  top: 1
})

interface Props {
  area: string
  canAssign: boolean
  cardIsActive: boolean
  task: TaskFooterUserAssignee_task
  useTaskChild: UseTaskChild
}

const TaskFooterUserAssigneeMenuRoot = lazyPreload(() =>
  import(
    /* webpackChunkName: 'TaskFooterUserAssigneeMenuRoot' */ '../TaskFooterUserAssigneeMenuRoot'
  )
)

const TaskFooterUserAssignee = (props: Props) => {
  const {area, canAssign, cardIsActive, task, useTaskChild} = props
  const {user} = task
  const userImage = user?.picture || avatarUser
  const preferredName = user?.preferredName || 'Unassigned'
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_LEFT)
  const {tooltipPortal, openTooltip, closeTooltip, originRef: tipRef} = useTooltip<HTMLDivElement>(
    MenuPosition.UPPER_CENTER
  )
  return (
    <>
      <TooltipToggle
        onMouseEnter={openTooltip}
        onMouseLeave={closeTooltip}
        onClick={closeTooltip}
        ref={tipRef}
      >
        <AvatarButton
          aria-label='Assign this task to a teammate'
          onClick={canAssign ? togglePortal : undefined}
          onMouseEnter={TaskFooterUserAssigneeMenuRoot.preload}
          ref={originRef}
        >
          <Avatar cardIsActive={cardIsActive} isAssigned={!!user}>
            {user ? (
              <AvatarImage alt={preferredName} src={userImage} />
            ) : (
              <StyledIcon>{'assignment_ind'}</StyledIcon>
            )}
          </Avatar>
          <AvatarLabel>{preferredName}</AvatarLabel>
        </AvatarButton>
      </TooltipToggle>
      {tooltipPortal(<div>{'Reassign Responsibility'}</div>)}
      {menuPortal(
        <TaskFooterUserAssigneeMenuRoot
          menuProps={menuProps}
          task={task}
          area={area}
          useTaskChild={useTaskChild}
        />
      )}
    </>
  )
}

export default createFragmentContainer(TaskFooterUserAssignee, {
  task: graphql`
    fragment TaskFooterUserAssignee_task on Task {
      ...TaskFooterUserAssigneeMenuRoot_task
      user {
        picture
        preferredName
      }
      team {
        name
      }
    }
  `
})
