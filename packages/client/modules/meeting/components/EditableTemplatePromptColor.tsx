import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import Icon from '~/components/Icon'
import PlainButton from '~/components/PlainButton/PlainButton'
import {BezierCurve} from '~/types/constEnums'
import {EditableTemplatePromptColor_prompt} from '~/__generated__/EditableTemplatePromptColor_prompt.graphql'
import {EditableTemplatePromptColor_prompts} from '~/__generated__/EditableTemplatePromptColor_prompts.graphql'
import PalettePicker from '../../../components/PalettePicker/PalettePicker'
import {MenuPosition} from '../../../hooks/useCoords'
import useMenu from '../../../hooks/useMenu'
import {PALETTE} from '../../../styles/paletteV3'
import {ICON_SIZE} from '../../../styles/typographyV2'

interface Props {
  isOwner: boolean
  prompt: EditableTemplatePromptColor_prompt
  prompts: EditableTemplatePromptColor_prompts
}

const PromptColor = styled(PlainButton)<{isOwner: boolean}>(({isOwner}) => ({
  cursor: isOwner ? 'pointer' : 'default',
  display: 'block',
  flex: 1,
  flexShrink: 0,
  height: 24,
  padding: 4,
  position: 'relative',
  width: 24,
  ':hover': {
    i: {
      opacity: isOwner ? 1 : undefined
    }
  }
}))

const ColorBadge = styled('div')<{groupColor?: string}>(({groupColor}) => ({
  backgroundColor: groupColor,
  borderRadius: '50%',
  height: 14,
  margin: 1,
  width: 14
}))

const DropdownIcon = styled(Icon)({
  bottom: 0,
  color: PALETTE.SLATE_600,
  fontSize: ICON_SIZE.MD18,
  height: 24,
  lineHeight: '24px',
  opacity: 0,
  position: 'absolute',
  right: -6,
  transition: `opacity 300ms ${BezierCurve.DECELERATE}`,
  width: 12
})

const EditableTemplatePromptColor = (props: Props) => {
  const {isOwner, prompt, prompts} = props
  const {groupColor} = prompt
  const {menuProps, menuPortal, originRef, togglePortal} = useMenu<HTMLButtonElement>(
    MenuPosition.UPPER_LEFT,
    {parentId: 'templateModal'}
  )
  return (
    <PromptColor ref={originRef} isOwner={isOwner} onClick={isOwner ? togglePortal : undefined}>
      <ColorBadge groupColor={groupColor} />
      <DropdownIcon>arrow_drop_down</DropdownIcon>
      {menuPortal(<PalettePicker menuProps={menuProps} prompt={prompt} prompts={prompts} />)}
    </PromptColor>
  )
}

export default createFragmentContainer(EditableTemplatePromptColor, {
  prompts: graphql`
    fragment EditableTemplatePromptColor_prompts on ReflectPrompt @relay(plural: true) {
      ...PalettePicker_prompts
    }
  `,
  prompt: graphql`
    fragment EditableTemplatePromptColor_prompt on ReflectPrompt {
      ...PalettePicker_prompt
      groupColor
    }
  `
})
