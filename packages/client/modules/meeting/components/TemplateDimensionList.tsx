import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {DragDropContext, Draggable, Droppable, DropResult} from 'react-beautiful-dnd'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '../../../hooks/useAtmosphere'
import MovePokerTemplateDimensionMutation from '../../../mutations/MovePokerTemplateDimensionMutation'
import dndNoise from '../../../utils/dndNoise'
import {TemplateDimensionList_dimensions} from '../../../__generated__/TemplateDimensionList_dimensions.graphql'
import TemplateDimensionItem from './TemplateDimensionItem'

interface Props {
  isOwner: boolean
  dimensions: TemplateDimensionList_dimensions
  templateId: string
}

const DimensionList = styled('div')({
  margin: 0,
  padding: 0,
  width: '100%'
})

const TEMPLATE_DIMENSION = 'TEMPLATE_DIMENSION'

const TemplateDimensionList = (props: Props) => {
  const {isOwner, dimensions, templateId} = props
  const atmosphere = useAtmosphere()

  const onDragEnd = (result: DropResult) => {
    const {source, destination} = result
    if (
      !destination ||
      destination.droppableId !== TEMPLATE_DIMENSION ||
      source.droppableId !== TEMPLATE_DIMENSION ||
      destination.index === source.index
    ) {
      return
    }

    const sourceDimension = dimensions[source.index]
    const destinationDimension = dimensions[destination.index]

    let sortOrder
    if (destination.index === 0) {
      sortOrder = destinationDimension.sortOrder - 1 + dndNoise()
    } else if (destination.index === dimensions.length - 1) {
      sortOrder = destinationDimension.sortOrder + 1 + dndNoise()
    } else {
      const offset = source.index > destination.index ? -1 : 1
      sortOrder =
        (dimensions[destination.index + offset].sortOrder + destinationDimension.sortOrder) / 2 +
        dndNoise()
    }

    const {id: dimensionId} = sourceDimension
    const variables = {dimensionId, sortOrder}
    MovePokerTemplateDimensionMutation(atmosphere, variables, {templateId})
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <DimensionList>
        <Droppable droppableId={TEMPLATE_DIMENSION} isDropDisabled={!isOwner}>
          {(provided) => {
            return (
              <div ref={provided.innerRef}>
                {dimensions.map((dimension, idx) => {
                  return (
                    <Draggable
                      key={dimension.id}
                      draggableId={dimension.id}
                      index={idx}
                      isDragDisabled={!isOwner}
                    >
                      {(dragProvided, dragSnapshot) => {
                        return (
                          <TemplateDimensionItem
                            isOwner={isOwner}
                            dimension={dimension}
                            dimensions={dimensions}
                            isDragging={dragSnapshot.isDragging}
                            dragProvided={dragProvided}
                          />
                        )
                      }}
                    </Draggable>
                  )
                })}
                {provided.placeholder}
              </div>
            )
          }}
        </Droppable>
      </DimensionList>
    </DragDropContext>
  )
}

export default createFragmentContainer(TemplateDimensionList, {
  dimensions: graphql`
    fragment TemplateDimensionList_dimensions on TemplateDimension @relay(plural: true) {
      id
      sortOrder
      ...TemplateDimensionItem_dimension
      ...TemplateDimensionItem_dimensions
    }
  `
})
