import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useTooltip from '~/hooks/useTooltip'
import CardButton from '../../../../components/CardButton'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import {UseTaskChild} from '../../../../hooks/useTaskChildFocus'
import textOverflow from '../../../../styles/helpers/textOverflow'
import {PALETTE} from '../../../../styles/paletteV3'
import {Radius} from '../../../../types/constEnums'
import lazyPreload from '../../../../utils/lazyPreload'
import {TaskFooterTeamAssignee_task} from '../../../../__generated__/TaskFooterTeamAssignee_task.graphql'

const TooltipToggle = styled('div')({
  width: '100%'
})
const TeamToggleButton = styled(CardButton)({
  ...textOverflow,
  border: 0,
  borderRadius: Radius.BUTTON_PILL,
  color: PALETTE.SLATE_600,
  display: 'block',
  fontSize: 12,
  fontWeight: 400,
  height: 24,
  lineHeight: '24px',
  marginLeft: -8,
  maxWidth: '100%',
  outline: 0,
  opacity: 1,
  padding: '0 8px',
  textAlign: 'left',
  ':hover, :focus': {
    color: PALETTE.SLATE_700,
    opacity: 1
  }
})

interface Props {
  canAssign: boolean
  task: TaskFooterTeamAssignee_task
  useTaskChild: UseTaskChild
}

const TaskFooterTeamAssigneeMenuRoot = lazyPreload(() =>
  import(
    /* webpackChunkName: 'TaskFooterTeamAssigneeMenuRoot' */ '../TaskFooterTeamAssigneeMenuRoot'
  )
)

const TaskFooterTeamAssignee = (props: Props) => {
  const {canAssign, task, useTaskChild} = props
  const {team} = task
  const {name: teamName} = team
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_LEFT)
  const {tooltipPortal, openTooltip, closeTooltip, originRef: tipRef} = useTooltip<HTMLDivElement>(
    MenuPosition.UPPER_CENTER
  )
  return (
    <>
      <TooltipToggle
        onClick={closeTooltip}
        onMouseEnter={openTooltip}
        onMouseLeave={closeTooltip}
        ref={tipRef}
      >
        <TeamToggleButton
          aria-label='Assign this task to another team'
          onClick={canAssign ? togglePortal : undefined}
          onMouseEnter={TaskFooterTeamAssigneeMenuRoot.preload}
          ref={originRef}
        >
          {teamName}
        </TeamToggleButton>
      </TooltipToggle>
      {tooltipPortal(<div>{'Reassign Team'}</div>)}
      {menuPortal(
        <TaskFooterTeamAssigneeMenuRoot
          menuProps={menuProps}
          task={task}
          useTaskChild={useTaskChild}
        />
      )}
    </>
  )
}

export default createFragmentContainer(TaskFooterTeamAssignee, {
  task: graphql`
    fragment TaskFooterTeamAssignee_task on Task {
      ...TaskFooterTeamAssigneeMenu_task
      team {
        name
      }
    }
  `
})
