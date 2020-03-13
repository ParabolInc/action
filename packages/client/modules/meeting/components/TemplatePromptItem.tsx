import {TemplatePromptItem_prompt} from '../../../__generated__/TemplatePromptItem_prompt.graphql'
import React, {Component} from 'react'
import {DraggableProvided} from 'react-beautiful-dnd'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import Icon from '../../../components/Icon'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../../decorators/withAtmosphere/withAtmosphere'
import EditableTemplateDescription from './EditableTemplateDescription'
import RemoveReflectTemplatePromptMutation from '../../../mutations/RemoveReflectTemplatePromptMutation'
import {ICON_SIZE} from '../../../styles/typographyV2'
import {PALETTE} from '../../../styles/paletteV2'
import withMutationProps, {WithMutationProps} from '../../../utils/relay/withMutationProps'
import EditableTemplatePrompt from './EditableTemplatePrompt'
import EditableTemplateColor from './EditableTemplateColor'

interface PassedProps {
  canRemove: boolean
  isDragging: boolean
  prompt: TemplatePromptItem_prompt
  prompts: any
  dragProvided: DraggableProvided
}

interface Props extends WithAtmosphereProps, WithMutationProps, PassedProps {}

interface State {
  isEditingDescription: boolean
  isHover: boolean
}

interface StyledProps {
  isDragging?: boolean
  isHover?: boolean
}

const lineHeight = '2.75rem'

const PromptItem = styled('li')<StyledProps>(({isHover, isDragging}) => ({
  alignItems: 'flex-start',
  backgroundColor: isHover || isDragging ? PALETTE.BACKGROUND_MAIN_LIGHTENED : undefined,
  borderRadius: '.125rem',
  display: 'flex',
  fontSize: 18,
  lineHeight,
  padding: '0 .6875rem 0 1rem'
}))

const RemovePromptIcon = styled(Icon)<StyledProps>(({isHover}) => ({
  color: PALETTE.TEXT_GRAY,
  cursor: 'pointer',
  display: 'block',
  fontSize: ICON_SIZE.MD18,
  lineHeight,
  marginLeft: 'auto',
  opacity: isHover ? 1 : 0
}))

const PromptAndDescription = styled('div')({
  width: '100%',
  display: 'flex'
})

const EditableTemplate = styled('div')``

class TemplatePromptItem extends Component<Props, State> {
  state = {
    isHover: false,
    isEditingDescription: false
  }
  onMouseEnter = () => {
    this.setState({
      isHover: true
    })
  }

  onMouseLeave = () => {
    this.setState({
      isHover: false
    })
  }

  onEditDescription = (isEditingDescription: boolean) => {
    this.setState({
      isEditingDescription
    })
  }

  removePrompt = () => {
    const {
      onError,
      onCompleted,
      submitting,
      submitMutation,
      atmosphere,
      prompt,
      prompts
    } = this.props
    if (submitting) return
    if (prompts.length <= 1) {
      onError('You must have at least 1 prompt')
      return
    }
    submitMutation()
    RemoveReflectTemplatePromptMutation(atmosphere, {promptId: prompt.id}, {}, onError, onCompleted)
  }

  render() {
    const {canRemove, dragProvided, isDragging, prompt, prompts} = this.props
    const {id: promptId, description, question} = prompt
    const {isEditingDescription, isHover} = this.state
    return (
      <PromptItem
        ref={dragProvided.innerRef}
        {...dragProvided.dragHandleProps}
        {...dragProvided.draggableProps}
        isDragging={isDragging}
        isHover={isHover}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
      >
        <PromptAndDescription>
          <EditableTemplateColor prompt={prompt} prompts={prompts} />
          <EditableTemplate>
            <EditableTemplatePrompt
              isEditingDescription={isEditingDescription}
              isHover={isHover}
              question={question}
              promptId={promptId}
              prompts={prompts}
            />
            <EditableTemplateDescription
              description={description}
              onEditingChange={this.onEditDescription}
              promptId={promptId}
            />
          </EditableTemplate>
        </PromptAndDescription>

        {canRemove && (
          <RemovePromptIcon isHover={isHover} onClick={this.removePrompt}>
            cancel
          </RemovePromptIcon>
        )}
      </PromptItem>
    )
  }
}

export default createFragmentContainer<PassedProps>(
  withAtmosphere(withMutationProps(TemplatePromptItem)),
  {
    prompt: graphql`
      fragment TemplatePromptItem_prompt on RetroPhaseItem {
        id
        question
        description
        color
      }
    `
  }
)
