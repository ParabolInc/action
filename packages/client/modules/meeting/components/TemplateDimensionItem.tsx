import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {DraggableProvided} from 'react-beautiful-dnd'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '~/hooks/useMutationProps'
import RemovePokerTemplateDimensionMutation from '~/mutations/RemovePokerTemplateDimensionMutation'
import {TemplateDimensionItem_dimensions} from '~/__generated__/TemplateDimensionItem_dimensions.graphql'
import Icon from '../../../components/Icon'
import {PALETTE} from '../../../styles/paletteV3'
import {ICON_SIZE} from '../../../styles/typographyV2'
import {TemplateDimensionItem_dimension} from '../../../__generated__/TemplateDimensionItem_dimension.graphql'
import EditableTemplateDimension from './EditableTemplateDimension'
import PokerTemplateScalePicker from './PokerTemplateScalePicker'

interface Props {
  isOwner: boolean
  isDragging: boolean
  dimension: TemplateDimensionItem_dimension
  dimensions: TemplateDimensionItem_dimensions
  dragProvided: DraggableProvided
}

interface StyledProps {
  isDragging?: boolean
  isHover?: boolean
  enabled?: boolean
}

const DimensionItem = styled('div')<StyledProps & {isOwner: boolean}>(
  ({isOwner, isHover, isDragging}) => ({
    alignItems: 'center',
    backgroundColor:
      isOwner && (isHover || isDragging) ? PALETTE.SLATE_100 : undefined,
    cursor: isOwner ? 'pointer' : undefined,
    display: 'flex',
    fontSize: 14,
    lineHeight: '24px',
    padding: '8px 16px',
    width: '100%'
  })
)

const RemoveDimensionIcon = styled(Icon)<StyledProps>(({isHover, enabled}) => ({
  color: PALETTE.SLATE_600,
  cursor: 'pointer',
  display: 'block',
  fontSize: ICON_SIZE.MD18,
  height: ICON_SIZE.MD24,
  lineHeight: '24px',
  marginLeft: 'auto',
  padding: 0,
  opacity: isHover ? 1 : 0,
  textAlign: 'center',
  visibility: enabled ? 'visible' : 'hidden',
  width: ICON_SIZE.MD24
}))

const DimensionAndDescription = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: 16
})

const TemplateDimensionItem = (props: Props) => {
  const {dragProvided, isDragging, isOwner, dimension, dimensions} = props
  const {id: dimensionId, name: dimensionName} = dimension
  const [isHover, setIsHover] = useState(false)
  const [isEditingDescription] = useState(false)
  const {submitting, submitMutation, onError, onCompleted} = useMutationProps()
  const atmosphere = useAtmosphere()
  const canRemove = dimensions.length > 1 && isOwner
  const onMouseEnter = () => {
    setIsHover(true)
  }
  const onMouseLeave = () => {
    setIsHover(false)
  }
  const removeDimension = () => {
    if (submitting) return
    if (!canRemove) {
      onError(new Error('You must have at least 1 dimension'))
      return
    }
    submitMutation()
    RemovePokerTemplateDimensionMutation(atmosphere, {dimensionId}, {onError, onCompleted})
  }

  return (
    <DimensionItem
      ref={dragProvided.innerRef}
      {...dragProvided.dragHandleProps}
      {...dragProvided.draggableProps}
      isDragging={isDragging}
      isHover={isHover}
      isOwner={isOwner}
      onMouseOver={onMouseEnter}
      onMouseOut={onMouseLeave}
    >
      <RemoveDimensionIcon isHover={isHover} onClick={removeDimension} enabled={canRemove}>
        cancel
      </RemoveDimensionIcon>
      <DimensionAndDescription>
        <EditableTemplateDimension
          isOwner={isOwner}
          isEditingDescription={isEditingDescription}
          isHover={isHover}
          dimensionName={dimensionName}
          dimensionId={dimensionId}
          dimensions={dimensions}
        />
      </DimensionAndDescription>
      <PokerTemplateScalePicker dimension={dimension} isOwner={isOwner} />
    </DimensionItem>
  )
}
export default createFragmentContainer(TemplateDimensionItem, {
  dimensions: graphql`
    fragment TemplateDimensionItem_dimensions on TemplateDimension @relay(plural: true) {
      ...EditableTemplateDimension_dimensions
    }
  `,
  dimension: graphql`
    fragment TemplateDimensionItem_dimension on TemplateDimension {
      ...PokerTemplateScalePicker_dimension
      id
      name
      description
    }
  `
})
