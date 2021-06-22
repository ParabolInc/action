import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import {AddScaleValueButtonInput_scale} from '~/__generated__/AddScaleValueButtonInput_scale.graphql'
import {Threshold} from '../../../types/constEnums'
import AddPokerTemplateScaleValue from './AddPokerTemplateScaleValue'
import NewTemplateScaleValueLabelInput from './NewTemplateScaleValueLabelInput'

interface Props {
  scale: AddScaleValueButtonInput_scale
}

const AddScaleValueButtonInput = (props: Props) => {
  const {scale} = props
  const [isAdding, setIsAdding] = useState(false)
  const {values} = scale
  if (values.length >= Threshold.MAX_POKER_SCALE_VALUES) return null
  const closeAdding = () => {
    setIsAdding(false)
  }
  if (isAdding) {
    return <NewTemplateScaleValueLabelInput closeAdding={closeAdding} scale={scale} />
  }
  return <AddPokerTemplateScaleValue onClick={() => setIsAdding(true)} />
}

export default createFragmentContainer(AddScaleValueButtonInput, {
  scale: graphql`
    fragment AddScaleValueButtonInput_scale on TemplateScale {
      ...NewTemplateScaleValueLabelInput_scale
      values {
        label
      }
    }
  `
})
