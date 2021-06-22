import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '../../../hooks/useAtmosphere'
import MoveReflectTemplatePromptMutation from '../../../mutations/MoveReflectTemplatePromptMutation'
import dndNoise from '../../../utils/dndNoise'
import {TemplatePromptList_prompts} from '../../../__generated__/TemplatePromptList_prompts.graphql'
import TemplatePromptItem from './TemplatePromptItem'

interface Props {
  isOwner: boolean
  prompts: TemplatePromptList_prompts
  templateId: string
}

const PromptList = styled('div')({
  margin: 0,
  padding: 0,
  width: '100%'
})

const TEMPLATE_PROMPT = 'TEMPLATE_PROMPT'

const TemplatePromptList = (props: Props) => {
  const {isOwner, prompts, templateId} = props
  const atmosphere = useAtmosphere()

  const onDragEnd = (result) => {
    const {source, destination} = result
    if (
      !destination ||
      destination.droppableId !== TEMPLATE_PROMPT ||
      source.droppableId !== TEMPLATE_PROMPT ||
      destination.index === source.index
    ) {
      return
    }

    const sourcePrompt = prompts[source.index]
    const destinationPrompt = prompts[destination.index]

    let sortOrder
    if (destination.index === 0) {
      sortOrder = destinationPrompt.sortOrder - 1 + dndNoise()
    } else if (destination.index === prompts.length - 1) {
      sortOrder = destinationPrompt.sortOrder + 1 + dndNoise()
    } else {
      const offset = source.index > destination.index ? -1 : 1
      sortOrder =
        (prompts[destination.index + offset].sortOrder + destinationPrompt.sortOrder) / 2 +
        dndNoise()
    }

    const {id: promptId} = sourcePrompt
    const variables = {promptId, sortOrder}
    MoveReflectTemplatePromptMutation(atmosphere, variables, {templateId})
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <PromptList>
        <Droppable droppableId={TEMPLATE_PROMPT} isDropDisabled={!isOwner}>
          {(provided) => {
            return (
              <div ref={provided.innerRef}>
                {prompts.map((prompt, idx) => {
                  return (
                    <Draggable
                      key={prompt.id}
                      draggableId={prompt.id}
                      index={idx}
                      isDragDisabled={!isOwner}
                    >
                      {(dragProvided, dragSnapshot) => {
                        return (
                          <TemplatePromptItem
                            isOwner={isOwner}
                            prompt={prompt}
                            prompts={prompts}
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
      </PromptList>
    </DragDropContext>
  )
}

export default createFragmentContainer(TemplatePromptList, {
  prompts: graphql`
    fragment TemplatePromptList_prompts on ReflectPrompt @relay(plural: true) {
      id
      sortOrder
      question
      groupColor
      ...TemplatePromptItem_prompt
      ...TemplatePromptItem_prompts
    }
  `
})
