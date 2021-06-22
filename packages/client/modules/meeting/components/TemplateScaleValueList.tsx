import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {DragDropContext, Droppable, Draggable, DropResult} from 'react-beautiful-dnd'
import {createFragmentContainer} from 'react-relay'
import {TemplateScaleValueList_scale} from '~/__generated__/TemplateScaleValueList_scale.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import MovePokerTemplateScaleValueMutation from '../../../mutations/MovePokerTemplateScaleValueMutation'
import isSpecialPokerLabel from '../../../utils/isSpecialPokerLabel'
import AddScaleValueButtonInput from './AddScaleValueButtonInput'
import TemplateScaleValueItem from './TemplateScaleValueItem'

interface Props {
  isOwner: boolean
  scale: TemplateScaleValueList_scale
}

const ScaleList = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  overflow: 'auto',
  width: '100%'
})

const TEMPLATE_SCALE_VALUE = 'TEMPLATE_SCALE_VALUE'

const TemplateScaleValueList = (props: Props) => {
  const {isOwner, scale} = props
  const {values} = scale
  const {onError, onCompleted, submitting, submitMutation} = useMutationProps()
  const atmosphere = useAtmosphere()

  const onDragEnd = (result: DropResult) => {
    const {source, destination} = result
    const {values: scaleValues} = scale
    if (
      !destination ||
      destination.droppableId !== TEMPLATE_SCALE_VALUE ||
      source.droppableId !== TEMPLATE_SCALE_VALUE ||
      destination.index === source.index
    ) {
      return
    }
    submitMutation()
    const sourceScaleValue = scaleValues[source.index]

    const variables = {scaleId: scale.id, label: sourceScaleValue.label, index: destination.index}
    MovePokerTemplateScaleValueMutation(atmosphere, variables, {onError, onCompleted})
  }

  return (
    <ScaleList>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={TEMPLATE_SCALE_VALUE} isDropDisabled={!isOwner}>
          {(provided) => {
            return (
              <div ref={provided.innerRef}>
                {values
                  .filter(({label}) => !isSpecialPokerLabel(label))
                  .map((scaleValue, idx) => (
                    <Draggable
                      key={scaleValue.id}
                      draggableId={scaleValue.id}
                      index={idx}
                      isDragDisabled={!isOwner || submitting}
                    >
                      {(dragProvided, dragSnapshot) => {
                        return (
                          <TemplateScaleValueItem
                            scale={scale}
                            scaleValue={scaleValue}
                            isDragging={dragSnapshot.isDragging}
                            dragProvided={dragProvided} />
                        )
                      }}
                    </Draggable>
                  ))}
                {provided.placeholder}
              </div>
            )
          }}
        </Droppable>
      </DragDropContext>
      <AddScaleValueButtonInput scale={scale} />
      {values
        .filter(({label}) => isSpecialPokerLabel(label))
        .map((scaleValue) => (
          <TemplateScaleValueItem
            key={scaleValue.id}
            scale={scale}
            scaleValue={scaleValue}
            isDragging={false}
          />
        ))}
    </ScaleList>
  )
}

export default createFragmentContainer(TemplateScaleValueList, {
  scale: graphql`
    fragment TemplateScaleValueList_scale on TemplateScale {
      ...TemplateScaleValueItem_scale
      ...AddScaleValueButtonInput_scale
      id
      values {
        id
        label
        ...TemplateScaleValueItem_scaleValue
      }
    }
  `
})
