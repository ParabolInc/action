import {EditorState} from 'draft-js'
import React from 'react'
import useTooltip from '~/hooks/useTooltip'
import CardButton from '../../../../components/CardButton'
import IconLabel from '../../../../components/IconLabel'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import {MenuMutationProps} from '../../../../hooks/useMutationProps'
import {UseTaskChild} from '../../../../hooks/useTaskChildFocus'
import {AreaEnum} from '~/__generated__/UpdateTaskMutation.graphql'
import lazyPreload from '../../../../utils/lazyPreload'

interface Props {
  area: AreaEnum
  editorState: EditorState
  isAgenda: boolean
  task: any
  useTaskChild: UseTaskChild
  mutationProps: MenuMutationProps
  dataCy: string
}

const TaskFooterTagMenu = lazyPreload(() =>
  import(/* webpackChunkName: 'TaskFooterTagMenu' */ '../OutcomeCardStatusMenu/TaskFooterTagMenu')
)

const TaskFooterTagMenuToggle = (props: Props) => {
  const {area, editorState, isAgenda, mutationProps, task, useTaskChild, dataCy} = props
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT)
  const {tooltipPortal, openTooltip, closeTooltip, originRef: tipRef} = useTooltip<HTMLDivElement>(
    MenuPosition.UPPER_CENTER
  )
  return (
    <>
      <CardButton
        dataCy={`${dataCy}-button`}
        onMouseEnter={TaskFooterTagMenu.preload}
        ref={originRef}
        onClick={togglePortal}
      >
        <IconLabel
          icon='more_vert'
          onMouseEnter={openTooltip}
          onMouseLeave={closeTooltip}
          onClick={closeTooltip}
          ref={tipRef}
        />
      </CardButton>
      {menuPortal(
        <TaskFooterTagMenu
          area={area}
          editorState={editorState}
          isAgenda={isAgenda}
          menuProps={menuProps}
          task={task}
          mutationProps={mutationProps}
          useTaskChild={useTaskChild}
        />
      )}
      {tooltipPortal(<div>{'Set Status'}</div>)}
    </>
  )
}

export default TaskFooterTagMenuToggle
