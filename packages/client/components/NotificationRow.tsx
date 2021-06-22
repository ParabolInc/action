import styled from '@emotion/styled'
import React, {ReactNode, useState} from 'react'
import {NotificationStatusEnum} from '../__generated__/NotificationDropdown_viewer.graphql'
import {PALETTE} from '../styles/paletteV3'

const Row = styled('div')<{isNew: boolean}>(({isNew}) => ({
  background: isNew ? PALETTE.SLATE_300 : '#fff',
  cursor: 'default',
  display: 'flex',
  width: '100%'
}))

const Avatar = styled('img')<{isParabol: boolean}>(({isParabol}) => ({
  background: '#fff',
  borderRadius: '100%',
  border: isParabol ? `solid 1px ${PALETTE.SLATE_400}` : undefined,
  height: 40,
  margin: 12,
  padding: isParabol ? 2 : undefined,
  width: 40
}))

const NewDotColumn = styled('div')({
  padding: 12
})

const Dot = styled('div')<{isNew: boolean}>(({isNew}) => ({
  background: PALETTE.ROSE_500,
  borderRadius: 10,
  height: 8,
  width: 8,
  visibility: isNew ? undefined : 'hidden'
}))

interface Props {
  avatar: string
  children: ReactNode
  isParabol: boolean
  status: NotificationStatusEnum
}

const NotificationRow = (props: Props) => {
  const {avatar, children, isParabol, status} = props
  const [initialStatus] = useState(status)
  const isClicked = initialStatus === 'CLICKED'
  const isNew = initialStatus === 'UNREAD'
  return (
    <Row isNew={!isClicked}>
      <Avatar isParabol={isParabol} src={avatar} />
      {children}
      <NewDotColumn>
        <Dot isNew={isNew} />
      </NewDotColumn>
    </Row>
  )
}

export default NotificationRow
