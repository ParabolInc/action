import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {convertToRaw, EditorState} from 'draft-js'
import React, {ReactNode, useRef, useState} from 'react'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useEditorState from '~/hooks/useEditorState'
import useMutationProps from '~/hooks/useMutationProps'
import AddReactjiToReactableMutation from '~/mutations/AddReactjiToReactableMutation'
import UpdateCommentContentMutation from '~/mutations/UpdateCommentContentMutation'
import convertToTaskContent from '~/utils/draftjs/convertToTaskContent'
import isAndroid from '~/utils/draftjs/isAndroid'
import isTempId from '~/utils/relay/isTempId'
import {ThreadedCommentBase_comment} from '~/__generated__/ThreadedCommentBase_comment.graphql'
import {ThreadedCommentBase_meeting} from '~/__generated__/ThreadedCommentBase_meeting.graphql'
import anonymousAvatar from '../styles/theme/images/anonymous-avatar.svg'
import deletedAvatar from '../styles/theme/images/deleted-avatar-placeholder.svg'
import CommentEditor from './TaskEditor/CommentEditor'
import ThreadedAvatarColumn from './ThreadedAvatarColumn'
import ThreadedCommentFooter from './ThreadedCommentFooter'
import ThreadedCommentHeader from './ThreadedCommentHeader'
import {ReplyMention, SetReplyMention} from './ThreadedItem'
import ThreadedItemReply from './ThreadedItemReply'
import ThreadedItemWrapper from './ThreadedItemWrapper'
import useFocusedReply from './useFocusedReply'

const BodyCol = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  paddingBottom: 8,
  width: 'calc(100% - 56px)'
})

const EditorWrapper = styled('div')({
  paddingRight: 16
})

interface Props {
  comment: ThreadedCommentBase_comment
  children?: ReactNode // the replies, listed here to avoid a circular reference
  meeting: ThreadedCommentBase_meeting
  isReply?: boolean // this comment is a reply & should be indented
  threadSourceId: string
  setReplyMention: SetReplyMention
  replyMention?: ReplyMention
  dataCy: string
}

const ThreadedCommentBase = (props: Props) => {
  const {children, comment, threadSourceId, replyMention, setReplyMention, meeting, dataCy} = props
  const isReply = !!props.isReply
  const {id: meetingId, replyingToCommentId, teamId} = meeting
  const {id: commentId, content, createdByUser, isActive, reactjis, threadParentId} = comment
  const ownerId = threadParentId || commentId
  const picture = isActive ? createdByUser?.picture ?? anonymousAvatar : deletedAvatar
  const {submitMutation, submitting, onError, onCompleted} = useMutationProps()
  const [editorState, setEditorState] = useEditorState(content)
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const ref = useRef<HTMLDivElement>(null)
  const replyEditorRef = useRef<HTMLTextAreaElement>(null)
  const [isEditing, setIsEditing] = useState(false)
  const atmosphere = useAtmosphere()
  useFocusedReply(ownerId, replyingToCommentId, ref, replyEditorRef)
  const editComment = () => {
    setIsEditing(true)
    setImmediate(() => {
      setEditorState(EditorState.moveFocusToEnd(editorState))
      editorRef.current?.focus()
    })
  }

  const onToggleReactji = (emojiId: string) => {
    if (submitting) return
    const isRemove = !!reactjis.find((reactji) => {
      return reactji.isViewerReactji && reactji.id.split(':')[1] === emojiId
    })
    submitMutation()
    AddReactjiToReactableMutation(
      atmosphere,
      {
        reactableType: 'COMMENT',
        reactableId: commentId,
        isRemove,
        reactji: emojiId,
        meetingId
      },
      {onCompleted, onError}
    )
    // when the reactjis move to the bottom & increase the height, make sure they're visible
    setImmediate(() => ref.current?.scrollIntoView({behavior: 'smooth'}))
  }

  const onReply = () => {
    if (createdByUser && threadParentId) {
      const {id: userId, preferredName} = createdByUser
      setReplyMention({userId, preferredName})
    }

    commitLocalUpdate(atmosphere, (store) => {
      store.get(meetingId)?.setValue(ownerId, 'replyingToCommentId')
    })
  }

  const onSubmit = () => {
    if (submitting || isTempId(commentId)) return
    const editorEl = editorRef.current
    if (isAndroid) {
      if (!editorEl || editorEl.type !== 'textarea') return
      const {value} = editorEl
      if (!value) return
      const initialContentState = editorState.getCurrentContent()
      const initialText = initialContentState.getPlainText()
      setIsEditing(false)
      if (initialText === value) return
      submitMutation()
      UpdateCommentContentMutation(
        atmosphere,
        {commentId, content: convertToTaskContent(value), meetingId},
        {onError, onCompleted}
      )
      return
    }
    const contentState = editorState.getCurrentContent()
    if (!contentState.hasText()) return
    const nextContent = JSON.stringify(convertToRaw(contentState))
    setIsEditing(false)
    if (content === nextContent) return
    submitMutation()
    UpdateCommentContentMutation(
      atmosphere,
      {commentId, content: nextContent, meetingId},
      {onError, onCompleted}
    )
  }

  return (
    <ThreadedItemWrapper data-cy={`${dataCy}-wrapper`} isReply={isReply} ref={ref}>
      <ThreadedAvatarColumn isReply={isReply} picture={picture} />
      <BodyCol>
        <ThreadedCommentHeader
          dataCy={dataCy}
          comment={comment}
          editComment={editComment}
          meetingId={meetingId}
          onToggleReactji={onToggleReactji}
          onReply={onReply}
        />
        {isActive && (
          <EditorWrapper>
            <CommentEditor
              dataCy={`${dataCy}`}
              editorRef={editorRef}
              teamId={teamId}
              editorState={editorState}
              setEditorState={setEditorState}
              onBlur={onSubmit}
              onSubmit={onSubmit}
              readOnly={!isEditing}
              placeholder={'Edit your comment'}
            />
          </EditorWrapper>
        )}
        {isActive && (
          <ThreadedCommentFooter
            reactjis={reactjis}
            onToggleReactji={onToggleReactji}
            onReply={onReply}
          />
        )}
        {children}
        <ThreadedItemReply
          dataCy={`${dataCy}-reply`}
          threadSourceId={threadSourceId}
          meeting={meeting}
          editorRef={replyEditorRef}
          replyMention={replyMention}
          setReplyMention={setReplyMention}
          threadable={comment}
        />
      </BodyCol>
    </ThreadedItemWrapper>
  )
}

export default createFragmentContainer(ThreadedCommentBase, {
  meeting: graphql`
    fragment ThreadedCommentBase_meeting on NewMeeting {
      ...DiscussionThreadInput_meeting
      ...ThreadedItemReply_meeting
      id
      replyingToCommentId
      teamId
    }
  `,
  comment: graphql`
    fragment ThreadedCommentBase_comment on Comment {
      ...ThreadedCommentHeader_comment
      ...ThreadedItemReply_threadable
      id
      isActive
      content
      createdByUser {
        id
        preferredName
        picture
      }
      reactjis {
        ...ThreadedCommentFooter_reactjis
        id
        isViewerReactji
      }
      threadParentId
    }
  `
})
