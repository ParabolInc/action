import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import EditableText from '../../../components/EditableText'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import RenameMeetingTemplateMutation from '../../../mutations/RenameMeetingTemplateMutation'
import Legitity from '../../../validation/Legitity'
import {EditableTemplateName_teamTemplates} from '../../../__generated__/EditableTemplateName_teamTemplates.graphql'

interface Props {
  name: string
  templateId: string
  teamTemplates: EditableTemplateName_teamTemplates
  isOwner: boolean
}

const InheritedStyles = styled('div')({
  flex: 1,
  fontSize: 20,
  fontWeight: 600,
  lineHeight: '24px'
})

const StyledEditableText = styled(EditableText)({
  lineHeight: '24px'
})
const EditableTemplateName = (props: Props) => {
  const {name, templateId, teamTemplates, isOwner} = props
  const atmosphere = useAtmosphere()
  const {onError, error, onCompleted, submitMutation, submitting} = useMutationProps()

  const handleSubmit = (rawName) => {
    if (submitting) return
    const {error, value: name} = validate(rawName)
    if (error) return
    submitMutation()
    RenameMeetingTemplateMutation(atmosphere, {templateId, name}, {onError, onCompleted})
  }

  const legitify = (value) => {
    return new Legitity(value)
      .trim()
      .required('Please enter a template name')
      .max(100, 'That name is probably long enough')
      .test((mVal) => {
        const isDupe = teamTemplates.find(
          (template) =>
            template.id !== templateId && template.name.toLowerCase() === mVal.toLowerCase()
        )
        return isDupe ? 'That name is taken' : undefined
      })
  }

  const validate = (rawValue: string) => {
    const res = legitify(rawValue)
    if (res.error) {
      onError(new Error(res.error))
    } else {
      onCompleted()
    }
    return res
  }

  return (
    <InheritedStyles>
      <StyledEditableText
        disabled={!isOwner}
        error={error ? error.message : undefined}
        handleSubmit={handleSubmit}
        initialValue={name}
        maxLength={100}
        validate={validate}
        placeholder={'*New Template'}
      />
    </InheritedStyles>
  )
}

export default createFragmentContainer(EditableTemplateName, {
  teamTemplates: graphql`
    fragment EditableTemplateName_teamTemplates on MeetingTemplate @relay(plural: true) {
      id
      name
    }
  `
})
