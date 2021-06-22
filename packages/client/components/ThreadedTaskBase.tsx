import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {ReactNode, useRef} from 'react'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import {PALETTE} from '~/styles/paletteV3'
import {ThreadedTaskBase_meeting} from '~/__generated__/ThreadedTaskBase_meeting.graphql'
import {ThreadedTaskBase_task} from '~/__generated__/ThreadedTaskBase_task.graphql'
import NullableTask from './NullableTask/NullableTask'
import ThreadedAvatarColumn from './ThreadedAvatarColumn'
import {ReplyMention, SetReplyMention} from './ThreadedItem'
import ThreadedItemHeaderDescription from './ThreadedItemHeaderDescription'
import ThreadedItemReply from './ThreadedItemReply'
import ThreadedItemWrapper from './ThreadedItemWrapper'
import ThreadedReplyButton from './ThreadedReplyButton'
import useFocusedReply from './useFocusedReply'

const BodyCol = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  paddingBottom: 8,
  width: '100%'
})

const HeaderActions = styled('div')({
  color: PALETTE.SLATE_600,
  fontWeight: 60,
  paddingRight: 32
})

const StyledNullableTask = styled(NullableTask)({
  //make the task assignee avatar line up with comment avatar above/below
  marginLeft: -12
})

interface Props {
  task: ThreadedTaskBase_task
  children?: ReactNode
  meeting: ThreadedTaskBase_meeting
  isReply?: boolean // this comment is a reply & should be indented
  threadSourceId: string
  setReplyMention: SetReplyMention
  replyMention?: ReplyMention
  dataCy: string
}

const ThreadedTaskBase = (props: Props) => {
  const {children, meeting, threadSourceId, setReplyMention, replyMention, task, dataCy} = props
  const isReply = !!props.isReply
  const {id: meetingId, replyingToCommentId} = meeting
  const {id: taskId, createdByUser, threadParentId} = task
  const {picture, preferredName} = createdByUser
  const atmosphere = useAtmosphere()
  const ref = useRef<HTMLDivElement>(null)
  const replyEditorRef = useRef<HTMLTextAreaElement>(null)
  const ownerId = threadParentId || taskId
  const onReply = () => {
    commitLocalUpdate(atmosphere, (store) => {
      store.get(meetingId)?.setValue(ownerId, 'replyingToCommentId')
    })
  }
  useFocusedReply(ownerId, replyingToCommentId, ref, replyEditorRef)
  return (
    <ThreadedItemWrapper data-cy={`${dataCy}-wrapper`} isReply={isReply} ref={ref}>
      <ThreadedAvatarColumn isReply={isReply} picture={picture} />
      <BodyCol>
        <ThreadedItemHeaderDescription title={preferredName} subTitle={'added a Task'}>
          <HeaderActions>
            <ThreadedReplyButton dataCy={`${dataCy}`} onReply={onReply} />
          </HeaderActions>
        </ThreadedItemHeaderDescription>
        <StyledNullableTask dataCy={`${dataCy}`} area='meeting' task={task} />
        {children}
        <ThreadedItemReply
          dataCy={`${dataCy}-reply`}
          threadSourceId={threadSourceId}
          meeting={meeting}
          threadable={task}
          editorRef={replyEditorRef}
          replyMention={replyMention}
          setReplyMention={setReplyMention}
        />
      </BodyCol>
    </ThreadedItemWrapper>
  )
}

export default createFragmentContainer(ThreadedTaskBase, {
  meeting: graphql`
    fragment ThreadedTaskBase_meeting on NewMeeting {
      ...ThreadedItemReply_meeting
      id
      replyingToCommentId
    }
  `,
  task: graphql`
    fragment ThreadedTaskBase_task on Task {
      ...NullableTask_task
      ...ThreadedItemReply_threadable
      id
      content
      createdByUser {
        picture
        preferredName
      }
      threadParentId
    }
  `
})
