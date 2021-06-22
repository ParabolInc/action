import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {Threshold} from '~/types/constEnums'
import Icon from '../../../components/Icon'
import LinkButton from '../../../components/LinkButton'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../../decorators/withAtmosphere/withAtmosphere'
import AddReflectTemplatePromptMutation from '../../../mutations/AddReflectTemplatePromptMutation'
import dndNoise from '../../../utils/dndNoise'
import withMutationProps, {WithMutationProps} from '../../../utils/relay/withMutationProps'
import {AddTemplatePrompt_prompts} from '../../../__generated__/AddTemplatePrompt_prompts.graphql'

const AddPromptLink = styled(LinkButton)({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'flex-start',
  fontSize: 16,
  // fontWeight: 600,
  lineHeight: '24px',
  margin: 0,
  marginBottom: 16,
  outline: 'none',
  padding: '4px 0'
})

const AddPromptLinkPlus = styled(Icon)({
  display: 'block',
  margin: '0 16px 0 16px'
})

interface Props extends WithAtmosphereProps, WithMutationProps {
  prompts: AddTemplatePrompt_prompts
  templateId: string
}

const AddTemplatePrompt = (props: Props) => {
  const addPrompt = () => {
    const {
      atmosphere,
      prompts,
      templateId,
      onError,
      onCompleted,
      submitMutation,
      submitting
    } = props
    if (submitting) return
    submitMutation()
    const sortOrders = prompts.map(({sortOrder}) => sortOrder)
    const sortOrder = Math.max(0, ...sortOrders) + 1 + dndNoise()
    const promptCount = prompts.length
    AddReflectTemplatePromptMutation(
      atmosphere,
      {templateId},
      {
        promptCount,
        sortOrder,
        onError,
        onCompleted
      }
    )
  }

  const {prompts, submitting} = props
  if (prompts.length >= Threshold.MAX_REFLECTION_PROMPTS) return null
  return (
    <AddPromptLink palette='blue' onClick={addPrompt} waiting={submitting}>
      <AddPromptLinkPlus>add</AddPromptLinkPlus>
      <div>Add another prompt</div>
    </AddPromptLink>
  )
}

export default createFragmentContainer(withMutationProps(withAtmosphere(AddTemplatePrompt)), {
  prompts: graphql`
    fragment AddTemplatePrompt_prompts on ReflectPrompt @relay(plural: true) {
      sortOrder
    }
  `
})
