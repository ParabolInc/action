// @flow
import * as React from 'react'
import styled from 'react-emotion'
import LoadableMenu from 'universal/components/LoadableMenu'
import LoadableDueDatePicker from 'universal/components/LoadableDueDatePicker'
import {createFragmentContainer} from 'react-relay'
import {shortMonths} from 'universal/utils/makeDateString'
import ui from 'universal/styles/ui'
import appTheme from 'universal/styles/theme/appTheme'
import StyledFontAwesome from 'universal/components/StyledFontAwesome'
import BaseButton from 'universal/components/BaseButton'
import ms from 'ms'

const Toggle = styled(BaseButton)(
  {
    alignItems: 'center',
    borderRadius: '.125rem',
    color: ui.colorText,
    cursor: 'pointer',
    display: 'flex',
    fontSize: 'inherit',
    height: '1.5rem',
    justifyContent: 'center',
    lineHeight: 'inherit',
    opacity: 0,
    outline: 0,
    padding: 0,
    width: '1.5rem'
  },
  ({cardIsActive}) => ({
    opacity: cardIsActive && 0.5,
    ':hover, :focus': {
      borderColor: appTheme.palette.mid50l,
      opacity: cardIsActive && 1
    }
  }),
  ({dueDate}) => ({
    color: dueDate && ui.dueDateColor,
    backgroundColor: dueDate && ui.dueDateBg,
    opacity: dueDate && 1
  }),
  ({isDueSoon}) => ({
    color: isDueSoon && ui.dueDateSoonColor,
    backgroundColor: isDueSoon && ui.dueDateSoonBg
  }),
  ({isPastDue}) => ({
    color: isPastDue && ui.dueDatePastColor,
    backgroundColor: isPastDue && ui.dueDatePastBg
  })
)

const DueDateIcon = styled(StyledFontAwesome)({
  fontSize: ui.iconSize
})

const DateString = styled('span')({
  marginLeft: '0.25rem'
})

const originAnchor = {
  vertical: 'bottom',
  horizontal: 'right'
}

const targetAnchor = {
  vertical: 'top',
  horizontal: 'right'
}

type Props = {|
  cardIsActive: Boolean,
  task: Object
|}

const formatDueDate = (dueDate) => {
  const date = new Date(dueDate)
  const month = date.getMonth()
  const day = date.getDate()
  const monthStr = shortMonths[month]
  return `${monthStr} ${day}`
}

const action = 'tap to change'
const getDateInfo = (dueDate) => {
  if (!dueDate) return {title: 'Add a due date'}
  const date = new Date(dueDate)
  const now = new Date()
  const timeDiff = date - now
  const diffDays = Math.ceil(timeDiff / ms('1d'))
  if (diffDays < 0) return {title: `Past due, ${action}`, isPastDue: true}
  if (diffDays < 3) return {title: `Due soon, ${action}`, isDueSoon: true}
  const dateString = formatDueDate(dueDate)
  return {title: `Due ${dateString}, ${action}`}
}

const DueDateToggle = (props: Props) => {
  const {cardIsActive, task} = props
  const {dueDate} = task
  const toggle = (
    <Toggle cardIsActive={!dueDate && cardIsActive} dueDate={dueDate} {...getDateInfo(dueDate)}>
      <DueDateIcon name='clock-o' />
      {dueDate && <DateString>{formatDueDate(dueDate)}</DateString>}
    </Toggle>
  )
  return (
    <LoadableMenu
      LoadableComponent={LoadableDueDatePicker}
      maxWidth={350}
      maxHeight={340}
      originAnchor={originAnchor}
      queryVars={{
        task
      }}
      targetAnchor={targetAnchor}
      toggle={toggle}
    />
  )
}

export default createFragmentContainer(
  DueDateToggle,
  graphql`
    fragment DueDateToggle_task on Task {
      dueDate
      ...DueDatePicker_task
    }
  `
)
