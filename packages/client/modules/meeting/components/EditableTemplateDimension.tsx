import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import RenamePokerTemplateDimensionMutation from '../../../mutations/RenamePokerTemplateDimensionMutation'
import EditableText from '../../../components/EditableText'
import Legitity from '../../../validation/Legitity'
import {EditableTemplateDimension_dimensions} from '../../../__generated__/EditableTemplateDimension_dimensions.graphql'
import {PALETTE} from '~/styles/paletteV3'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import useScrollIntoView from '../../../hooks/useScrollIntoVIew'

const StyledEditableText = styled(EditableText)({
  fontFamily: PALETTE.SLATE_700,
  fontSize: 14,
  lineHeight: '24px',
  padding: 0
})

interface Props {
  isOwner: boolean
  isEditingDescription: boolean
  isHover: boolean
  dimensionName: string
  dimensionId: string
  dimensions: EditableTemplateDimension_dimensions
}

const EditableTemplateDimension = (props: Props) => {
  const {dimensionId, dimensions} = props
  const atmosphere = useAtmosphere()
  const {onError, error, onCompleted, submitMutation, submitting} = useMutationProps()

  const handleSubmit = (rawDimensionName) => {
    if (submitting) return
    const {error, value: name} = validate(rawDimensionName)
    if (error) return
    submitMutation()
    RenamePokerTemplateDimensionMutation(atmosphere, {dimensionId, name}, {onError, onCompleted})
  }

  const legitify = (value: string) => {
    return new Legitity(value)
      .trim()
      .required('Please enter a dimension name')
      .max(100, 'That dimension name is probably long enough')
      .test((mVal) => {
        const isDupe = dimensions.find(
          (dimension) =>
            dimension.id !== dimensionId && dimension.name.toLowerCase() === mVal.toLowerCase()
        )
        return isDupe ? 'That dimension already exists' : undefined
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

  const {isOwner, isHover, isEditingDescription, dimensionName} = props
  const autoFocus = dimensionName.startsWith('*New Dimension #')
  const ref = useRef<HTMLDivElement>(null)
  useScrollIntoView(ref, autoFocus)
  return (
    <StyledEditableText
      ref={ref}
      autoFocus={autoFocus}
      disabled={!isOwner}
      error={error?.message}
      hideIcon={isEditingDescription ? true : !isHover}
      handleSubmit={handleSubmit}
      initialValue={dimensionName}
      maxLength={50}
      validate={validate}
      placeholder={dimensionName}
    />
  )
}

export default createFragmentContainer(EditableTemplateDimension, {
  dimensions: graphql`
    fragment EditableTemplateDimension_dimensions on TemplateDimension @relay(plural: true) {
      id
      name
    }
  `
})
