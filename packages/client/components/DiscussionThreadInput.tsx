import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {ContentState, convertToRaw, EditorState} from 'draft-js'
import React, {forwardRef, RefObject, useEffect, useState} from 'react'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '~/hooks/useMutationProps'
import useReplyEditorState from '~/hooks/useReplyEditorState'
import AddCommentMutation from '~/mutations/AddCommentMutation'
import EditCommentingMutation from '~/mutations/EditCommentingMutation'
import {Elevation} from '~/styles/elevation'
import {SORT_STEP} from '~/utils/constants'
import dndNoise from '~/utils/dndNoise'
import convertToTaskContent from '~/utils/draftjs/convertToTaskContent'
import isAndroid from '~/utils/draftjs/isAndroid'
import {
  MeetingTypeEnum,
  DiscussionThreadInput_meeting
} from '~/__generated__/DiscussionThreadInput_meeting.graphql'
import {ThreadSourceEnum} from '~/__generated__/UpdateTaskMutation.graphql'
import anonymousAvatar from '../styles/theme/images/anonymous-avatar.svg'
import Avatar from './Avatar/Avatar'
import CommentSendOrAdd from './CommentSendOrAdd'
import CommentEditor from './TaskEditor/CommentEditor'
import {ReplyMention, SetReplyMention} from './ThreadedItem'

const Wrapper = styled('div')<{isReply: boolean; isDisabled: boolean}>(({isDisabled, isReply}) => ({
  alignItems: 'flex-end',
  borderRadius: isReply ? '4px 0 0 4px' : undefined,
  display: 'flex',
  boxShadow: isReply ? Elevation.Z2 : Elevation.DISCUSSION_INPUT,
  opacity: isDisabled ? 0.5 : undefined,
  marginLeft: isReply ? -12 : undefined,
  marginTop: isReply ? 8 : undefined,
  pointerEvents: isDisabled ? 'none' : undefined,
  // required for the shadow to overlay draft-js in the task cards
  zIndex: 0
}))

const CommentAvatar = styled(Avatar)({
  margin: 8,
  transition: 'all 150ms'
})

const EditorWrap = styled('div')({
  flex: 1,
  margin: '14px 0'
})

interface Props {
  editorRef: RefObject<HTMLTextAreaElement>
  getMaxSortOrder: () => number
  meeting: DiscussionThreadInput_meeting
  onSubmitCommentSuccess?: () => void
  threadSourceId: string
  threadParentId?: string
  isReply?: boolean
  isDisabled?: boolean
  setReplyMention?: SetReplyMention
  replyMention?: ReplyMention
  dataCy: string
}

const DiscussionThreadInput = forwardRef((props: Props, ref: any) => {
  const {
    editorRef,
    getMaxSortOrder,
    meeting,
    onSubmitCommentSuccess,
    threadSourceId,
    threadParentId,
    replyMention,
    setReplyMention,
    dataCy
  } = props
  const isReply = !!props.isReply
  const isDisabled = !!props.isDisabled
  const {id: meetingId, isAnonymousComment, teamId, viewerMeetingMember, meetingType} = meeting
  const picture = viewerMeetingMember?.user.picture ?? anonymousAvatar
  const [editorState, setEditorState] = useReplyEditorState(replyMention, setReplyMention)
  const atmosphere = useAtmosphere()
  const {submitting, onError, onCompleted, submitMutation} = useMutationProps()
  const [isCommenting, setIsCommenting] = useState(false)
  const placeholder = isAnonymousComment ? 'Comment anonymously' : 'Comment publicly'
  const [lastTypedTimestamp, setLastTypedTimestamp] = useState<Date>()

  const threadSourceByMeetingType = {
    retrospective: 'REFLECTION_GROUP',
    action: 'AGENDA_ITEM',
    poker: 'STORY'
  } as Record<MeetingTypeEnum, ThreadSourceEnum>
  const threadSource = threadSourceByMeetingType[meetingType]

  useEffect(() => {
    const inactiveCommenting = setTimeout(() => {
      if (isCommenting) {
        EditCommentingMutation(
          atmosphere,
          {
            isCommenting: false,
            meetingId,
            threadId: threadSourceId
          },
          {onError, onCompleted}
        )
        setIsCommenting(false)
      }
    }, 5000)
    return () => {
      clearTimeout(inactiveCommenting)
    }
  }, [lastTypedTimestamp])

  const toggleAnonymous = () => {
    commitLocalUpdate(atmosphere, (store) => {
      const meeting = store.get(meetingId)
      if (!meeting) return
      meeting.setValue(!meeting.getValue('isAnonymousComment'), 'isAnonymousComment')
    })
    editorRef.current?.focus()
  }
  const [canCollapse, setCanCollapse] = useState(isReply)
  const hasText = editorState.getCurrentContent().hasText()
  const commentSubmitState = hasText ? 'send' : canCollapse ? 'add' : 'addExpanded'
  const collapseAddTask = () => {
    if (!canCollapse) {
      setCanCollapse(true)
    }
  }

  const addComment = (rawContent: string) => {
    submitMutation()
    const comment = {
      content: rawContent,
      isAnonymous: isAnonymousComment,
      threadId: threadSourceId,
      threadParentId,
      threadSource: threadSource,
      threadSortOrder: getMaxSortOrder() + SORT_STEP + dndNoise()
    }
    AddCommentMutation(atmosphere, {comment, meetingId}, {onError, onCompleted})
    // move focus to end is very important! otherwise ghost chars appear
    setEditorState(
      EditorState.moveFocusToEnd(
        EditorState.push(editorState, ContentState.createFromText(''), 'remove-range')
      )
    )
    onSubmitCommentSuccess?.()
  }

  const ensureCommenting = () => {
    const timestamp = new Date()
    setLastTypedTimestamp(timestamp)

    collapseAddTask()
    if (isAnonymousComment || isCommenting) return
    EditCommentingMutation(
      atmosphere,
      {
        isCommenting: true,
        meetingId,
        threadId: threadSourceId
      },
      {onError, onCompleted}
    )
    setIsCommenting(true)
  }

  const ensureNotCommenting = () => {
    if (isAnonymousComment || !isCommenting) return
    EditCommentingMutation(
      atmosphere,
      {
        isCommenting: false,
        meetingId,
        threadId: threadSourceId
      },
      {onError, onCompleted}
    )
    setIsCommenting(false)
  }

  const onSubmit = () => {
    if (submitting) return
    ensureNotCommenting()
    const editorEl = editorRef.current
    if (isAndroid) {
      if (!editorEl || editorEl.type !== 'textarea') return
      const {value} = editorEl
      if (!value) return
      addComment(convertToTaskContent(value))
      return
    }
    const content = editorState.getCurrentContent()
    if (!content.hasText()) return
    addComment(JSON.stringify(convertToRaw(content)))
  }

  const avatar = isAnonymousComment ? anonymousAvatar : picture
  return (
    <Wrapper data-cy={`${dataCy}-wrapper`} ref={ref} isReply={isReply} isDisabled={isDisabled}>
      <CommentAvatar size={32} picture={avatar} onClick={toggleAnonymous} />
      <EditorWrap>
        <CommentEditor
          dataCy={`${dataCy}`}
          editorRef={editorRef}
          editorState={editorState}
          ensureCommenting={ensureCommenting}
          onBlur={ensureNotCommenting}
          onSubmit={onSubmit}
          placeholder={placeholder}
          setEditorState={setEditorState}
          teamId={teamId}
        />
      </EditorWrap>
      {meetingType !== 'poker' && (
        <CommentSendOrAdd
          dataCy={`${dataCy}`}
          getMaxSortOrder={getMaxSortOrder}
          commentSubmitState={commentSubmitState}
          meeting={meeting}
          threadSourceId={threadSourceId}
          threadParentId={threadParentId}
          threadSource={threadSource}
          collapseAddTask={collapseAddTask}
          onSubmit={onSubmit}
        />
      )}
    </Wrapper>
  )
})

export default createFragmentContainer(DiscussionThreadInput, {
  meeting: graphql`
    fragment DiscussionThreadInput_meeting on NewMeeting {
      ...CommentSendOrAdd_meeting
      id
      teamId
      meetingType
      isAnonymousComment
      viewerMeetingMember {
        user {
          picture
        }
      }
    }
  `
})
