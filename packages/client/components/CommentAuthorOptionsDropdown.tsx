import React from 'react'
import useAtmosphere from '~/hooks/useAtmosphere'
import DeleteCommentMutation from '~/mutations/DeleteCommentMutation'
import {MenuProps} from '../hooks/useMenu'
import Menu from './Menu'
import MenuItem from './MenuItem'
import MenuItemWithIcon from './MenuItemWithIcon'

interface Props {
  menuProps: MenuProps
  commentId: string
  editComment: () => void
  meetingId: string
}

const CommentAuthorOptionsDropdown = (props: Props) => {
  const {commentId, editComment, meetingId, menuProps} = props
  const atmosphere = useAtmosphere()
  const deleteComment = () => {
    DeleteCommentMutation(atmosphere, {commentId, meetingId})
  }
  return (
    <Menu ariaLabel={'Select the action for your comment'} {...menuProps}>
      <MenuItem
        label={<MenuItemWithIcon dataCy='edit-comment' label={'Edit Comment'} icon={'edit'} />}
        onClick={editComment}
      />
      <MenuItem
        label={
          <MenuItemWithIcon dataCy='delete-comment' label={'Delete Comment'} icon={'delete'} />
        }
        onClick={deleteComment}
      />
    </Menu>
  )
}

export default CommentAuthorOptionsDropdown
