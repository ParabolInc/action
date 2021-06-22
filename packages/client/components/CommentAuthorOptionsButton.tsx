import styled from '@emotion/styled'
import React from 'react'
import {MenuPosition} from '~/hooks/useCoords'
import useMenu from '~/hooks/useMenu'
import {PALETTE} from '~/styles/paletteV3'
import lazyPreload from '~/utils/lazyPreload'
import Icon from './Icon'
import PlainButton from './PlainButton/PlainButton'

const CommentAuthorOptionsDropdown = lazyPreload(() =>
  import(/* webpackChunkName: 'CommentAuthorOptionsDropdown' */ './CommentAuthorOptionsDropdown')
)

const StyledButton = styled(PlainButton)({
  ':hover, :focus, :active': {
    color: PALETTE.SLATE_700
  }
})

const StyledIcon = styled(Icon)({
  borderRadius: 24,
  color: 'inherit',
  display: 'block',
  flexShrink: 0,
  fontSize: 18,
  height: 24,
  lineHeight: '24px',
  marginLeft: 'auto',
  textAlign: 'center',
  width: 24
})

interface Props {
  commentId: string
  editComment: () => void
  dataCy: string
  meetingId: string
}

const CommentAuthorOptionsButton = (props: Props) => {
  const {commentId, editComment, dataCy, meetingId} = props
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT)
  return (
    <StyledButton
      data-cy={`${dataCy}-dropdown-menu`}
      onMouseEnter={CommentAuthorOptionsDropdown.preload}
      ref={originRef}
      onClick={togglePortal}
    >
      <StyledIcon>more_vert</StyledIcon>
      {menuPortal(
        <CommentAuthorOptionsDropdown
          menuProps={menuProps}
          commentId={commentId}
          editComment={editComment}
          meetingId={meetingId}
        />
      )}
    </StyledButton>
  )
}

export default CommentAuthorOptionsButton
