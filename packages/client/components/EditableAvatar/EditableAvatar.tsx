import React from 'react'
import styled from '@emotion/styled'
import Avatar from '../Avatar/Avatar'
import {panelShadow} from '../../styles/elevation'
import {PALETTE} from '../../styles/paletteV3'
import Icon from '../Icon'

const borderRadius = '50%'
const borderRadiusPanel = 4
const panelPadding = 8
const panelPaddingHorizontal = panelPadding * 2

const EditableAvatarRoot = styled('div')<Pick<Props, 'hasPanel' | 'size'>>(({hasPanel, size}) => ({
  backgroundColor: hasPanel ? '#FFFFFF' : undefined,
  boxShadow: hasPanel ? panelShadow : undefined,
  borderRadius: hasPanel ? borderRadiusPanel : borderRadius,
  height: size,
  padding: hasPanel ? panelPadding : '',
  position: 'relative',
  width: size
}))

const EditableAvatarEditOverlay = styled('div')<Pick<Props, 'hasPanel' | 'size'>>(
  ({hasPanel, size}) => ({
    alignItems: 'center',
    backgroundColor: PALETTE.SLATE_700,
    borderRadius: hasPanel ? borderRadiusPanel : borderRadius,
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    fontSize: 14,
    fontWeight: 600,
    height: size,
    justifyContent: 'center',
    left: 0,
    opacity: 0,
    position: 'absolute',
    top: 0,
    width: size,
    zIndex: 2,

    '&:hover': {
      opacity: 0.75,
      transition: 'opacity .2s ease-in'
    }
  })
)

const EditableAvatarImgBlock = styled('div')<Pick<Props, 'hasPanel' | 'size'>>(
  ({hasPanel, size}) => ({
    height: hasPanel ? size - panelPaddingHorizontal : size,
    position: 'relative',
    width: hasPanel ? size - panelPaddingHorizontal : size,
    zIndex: 1
  })
)

interface Props {
  hasPanel?: boolean
  onClick?: () => void
  picture: string
  size: number
  unstyled?: boolean
}

const EditableAvatar = (props: Props) => {
  const {hasPanel, onClick, picture, size, unstyled} = props
  const avatarSize = hasPanel ? size - panelPaddingHorizontal : size
  return (
    <EditableAvatarRoot hasPanel={hasPanel} size={size}>
      <EditableAvatarEditOverlay hasPanel={hasPanel} onClick={onClick} size={size}>
        <Icon>edit</Icon>
        <span>{'EDIT'}</span>
      </EditableAvatarEditOverlay>
      <EditableAvatarImgBlock hasPanel={hasPanel} size={size}>
        <Avatar picture={picture} size={avatarSize} sansRadius={unstyled} sansShadow={unstyled} />
      </EditableAvatarImgBlock>
    </EditableAvatarRoot>
  )
}

export default EditableAvatar
