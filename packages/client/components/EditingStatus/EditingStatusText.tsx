import React, {useCallback, useEffect, useRef, useState} from 'react'
import relativeDate from '../../utils/date/relativeDate'
import Ellipsis from '../Ellipsis/Ellipsis'
import getRefreshPeriod from '../../utils/getRefreshPeriod'
import {TimestampType} from './EditingStatus'

interface Props {
  editors: {preferredName: string}[]
  isEditing: boolean
  timestamp: string
  timestampType: TimestampType
  isArchived?: boolean
}

const useTimeFrom = (timestamp: string) => {
  const makeTimeFrom = useCallback(() => relativeDate(timestamp, {smallDiff: 'just now'}), [
    timestamp
  ])
  const [timeFrom, setTimeFrom] = useState(makeTimeFrom)
  const timeoutRef = useRef<number | undefined>()
  useEffect(() => {
    timeoutRef.current = window.setTimeout(() => {
      setTimeFrom(makeTimeFrom())
    }, getRefreshPeriod(timestamp))
    return () => {
      window.clearTimeout(timeoutRef.current)
    }
  }, [makeTimeFrom, timeFrom, timestamp])
  return timeFrom
}

const EditingStatusText = (props: Props) => {
  const {editors, isEditing, timestamp, timestampType, isArchived} = props
  const timestampLabel = timestampType === 'createdAt' ? 'Created ' : 'Updated '
  const timeFrom = useTimeFrom(timestamp)
  if (isArchived) {
    return <span>{`${timestampLabel}${timeFrom}`}</span>
  }
  if (editors.length === 0) {
    if (isEditing) {
      return (
        <span>
          {'Editing'}
          <Ellipsis />
        </span>
      )
    }
    return <span>{`${timestampLabel}${timeFrom}`}</span>
  }
  const editorNames = editors.map((editor) => editor.preferredName)
  // one other is editing
  if (editors.length === 1) {
    const editor = editorNames[0]
    return (
      <span>
        {editor}
        {' editing'}
        {isEditing ? ' too' : ''}
        <Ellipsis />
      </span>
    )
  }
  if (editors.length === 2) {
    if (isEditing) {
      return (
        <span>
          several are editing
          <Ellipsis />
        </span>
      )
    }
    return (
      <span>
        {`${editorNames[0]} and ${editorNames[1]} editing`}
        <Ellipsis />
      </span>
    )
  }
  return (
    <span>
      {'Several are editing'}
      <Ellipsis />
    </span>
  )
}

export default EditingStatusText
