import React, {forwardRef} from 'react'
import MockJiraFieldLine from '../modules/meeting/components/MockJiraFieldLine'

// forwardRef is just here to ignore warnings when this appears in a menu
const MockJiraFieldList = forwardRef(() => {
  return (
    <>
      {Array.from(Array(3).keys()).map((idx) => {
        return <MockJiraFieldLine key={idx} delay={idx * 40} />
      })}
    </>
  )
})

export default MockJiraFieldList
