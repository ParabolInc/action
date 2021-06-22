import React from 'react'
import DayPicker, {DayModifiers} from 'react-day-picker'
import '../styles/daypicker.css'
import Menu from './Menu'
import {MenuProps} from '../hooks/useMenu'
import UpdateTaskDueDateMutation from '../mutations/UpdateTaskDueDateMutation'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {DueDatePicker_task} from '../__generated__/DueDatePicker_task.graphql'
import styled from '@emotion/styled'
import {PALETTE} from '../styles/paletteV3'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import {UseTaskChild} from '../hooks/useTaskChildFocus'

interface Props {
  menuProps: MenuProps
  task: DueDatePicker_task
  useTaskChild: UseTaskChild
}

const TallMenu = styled(Menu)({
  maxHeight: 340
})

const PickerTitle = styled('div')({
  fontSize: 14,
  textAlign: 'center',
  userSelect: 'none',
  width: '100%'
})

const Hint = styled('div')({
  fontSize: 11,
  color: PALETTE.SLATE_600,
  textAlign: 'center'
})

const DueDatePicker = (props: Props) => {
  const {menuProps, task, useTaskChild} = props
  const {id: taskId, dueDate} = task
  useTaskChild('dueDate')
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitMutation, submitting} = useMutationProps()
  const handleDayClick = (day: Date, {disabled, selected}: DayModifiers) => {
    if (disabled || submitting) return
    submitMutation()
    const dueDate = selected ? null : day
    UpdateTaskDueDateMutation(atmosphere, {taskId, dueDate}, onCompleted, onError)
    menuProps.closePortal()
      ; (document as any).activeElement?.blur()
  }

  const selectedDate = dueDate ? new Date(dueDate) : undefined
  const showHint = false
  const now = new Date()
  const nextYear = new Date(new Date().setFullYear(now.getFullYear() + 1))
  return (
    <TallMenu ariaLabel='Pick a due date' {...menuProps}>
      <PickerTitle>{'Change Due Date'}</PickerTitle>
      {showHint && <Hint>{'To remove, tap selected date'}</Hint>}
      <DayPicker
        disabledDays={{before: now}}
        fromMonth={selectedDate || now}
        initialMonth={selectedDate || now}
        onDayClick={handleDayClick}
        selectedDays={selectedDate}
        toMonth={nextYear}
      />
    </TallMenu>
  )
}

export default createFragmentContainer(DueDatePicker, {
  task: graphql`
    fragment DueDatePicker_task on Task {
      id
      dueDate
    }
  `
})
