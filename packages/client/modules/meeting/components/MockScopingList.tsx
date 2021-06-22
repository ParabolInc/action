import React from 'react'
import MockScopingTask from './MockScopingTask'

const MockScopingList = () => {
  return (
    <>
      {Array.from(Array(6).keys()).map((idx) => {
        return <MockScopingTask key={idx} idx={idx} />
      })}
    </>
  )
}

export default MockScopingList
