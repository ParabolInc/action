import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import EditableText from '../../../components/EditableText'
import Legitity from '../../../validation/Legitity'
import {PALETTE} from '~/styles/paletteV3'
import UpdatePokerTemplateScaleValueMutation from '~/mutations/UpdatePokerTemplateScaleValueMutation'
import {EditableTemplateScaleValueLabel_scaleValue} from '~/__generated__/EditableTemplateScaleValueLabel_scaleValue.graphql'
import {EditableTemplateScaleValueLabel_scale} from '~/__generated__/EditableTemplateScaleValueLabel_scale.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import isSpecialPokerLabel from '../../../utils/isSpecialPokerLabel'

const StyledEditableText = styled(EditableText)<{disabled: boolean | undefined}>(({disabled}) => ({
  fontFamily: PALETTE.SLATE_700,
  fontSize: 14,
  lineHeight: '24px',
  padding: 0,
  userSelect: disabled ? 'none' : 'auto'
}))

interface Props {
  isHover: boolean
  scale: EditableTemplateScaleValueLabel_scale
  scaleValue: EditableTemplateScaleValueLabel_scaleValue
}

const EditableTemplateScaleValueLabel = (props: Props) => {
  const {isHover, scaleValue, scale} = props
  const {id: scaleId} = scale
  const {id: scaleValueId, label, color} = scaleValue
  const atmosphere = useAtmosphere()
  const {onError, error, onCompleted, submitMutation, submitting} = useMutationProps()

  const handleSubmit = (rawScaleLabel) => {
    if (submitting) return
    const {error, value: newLabel} = validate(rawScaleLabel)
    if (error) return
    submitMutation()

    const oldScaleValue = {label, color}
    const newScaleValue = {label: newLabel, color}
    UpdatePokerTemplateScaleValueMutation(
      atmosphere,
      {scaleId, oldScaleValue, newScaleValue},
      {onError, onCompleted}
    )
  }

  const legitify = (value: string) => {
    return new Legitity(value)
      .trim()
      .required('Please enter a value')
      .max(2, 'Value cannot be longer than 2 characters')
      .test((mVal) => {
        const isDupe = mVal
          ? scale.values.find(
            (aScaleValue) =>
              aScaleValue.id !== scaleValueId &&
              aScaleValue.label.toLowerCase() === mVal.toLowerCase()
          )
          : undefined
        return isDupe ? 'That value already exists' : undefined
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
    <StyledEditableText
      disabled={isSpecialPokerLabel(scaleValue.label)}
      error={error?.message}
      hideIcon={!isHover}
      handleSubmit={handleSubmit}
      initialValue={scaleValue.label}
      maxLength={5}
      validate={validate}
      placeholder={''}
    />
  )
}

export default createFragmentContainer(EditableTemplateScaleValueLabel, {
  scale: graphql`
    fragment EditableTemplateScaleValueLabel_scale on TemplateScale {
      id
      values {
        id
        label
        color
      }
    }
  `,
  scaleValue: graphql`
    fragment EditableTemplateScaleValueLabel_scaleValue on TemplateScaleValue {
      id
      label
      color
    }
  `
})
