import React from 'react'
import DetailAction from '../../../components/DetailAction'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import {Threshold} from '../../../types/constEnums'
import AddPokerTemplateScaleMutation from '../../../mutations/AddPokerTemplateScaleMutation'
import RemovePokerTemplateScaleMutation from '../../../mutations/RemovePokerTemplateScaleMutation'
import styled from '@emotion/styled'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {ScaleActions_scale} from '../../../__generated__/ScaleActions_scale.graphql'

const CloneAndDelete = styled('div')({
  display: 'flex',
  flexDirection: 'row'
})

interface Props {
  scale: ScaleActions_scale
  scaleCount: number
  teamId: string
}

const ScaleActions = (props: Props) => {
  const {scale, scaleCount, teamId} = props
  const {id: scaleId, isStarter} = scale
  const atmosphere = useAtmosphere()
  const {onError, onCompleted, submitting, submitMutation} = useMutationProps()
  const canClone = scaleCount < Threshold.MAX_POKER_TEMPLATE_SCALES
  const cloneTooltip = canClone
    ? 'Clone default scale'
    : 'Too many team templates! Remove one first'
  const cloneScale = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (submitting || !canClone) return
    if (isStarter) {
      submitMutation()
      AddPokerTemplateScaleMutation(
        atmosphere,
        {parentScaleId: scaleId, teamId},
        {onError, onCompleted}
      )
    }
  }
  const editScale = () => {
    commitLocalUpdate(atmosphere, (store) => {
      store.get(teamId)?.setValue(scaleId, 'editingScaleId')
    })
  }
  const deleteScale = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (submitting) return
    submitMutation()
    RemovePokerTemplateScaleMutation(atmosphere, {scaleId}, {onError, onCompleted})
  }
  return (
    <CloneAndDelete>
      {isStarter ? (
        <DetailAction
          disabled={!canClone}
          icon={'content_copy'}
          tooltip={cloneTooltip}
          onClick={cloneScale}
        />
      ) : (
        <>
          <DetailAction icon={'edit'} tooltip={'Edit scale'} onClick={editScale} />
          <DetailAction icon={'delete'} tooltip={'Delete scale'} onClick={deleteScale} />
        </>
      )}
    </CloneAndDelete>
  )
}
export default createFragmentContainer(ScaleActions, {
  scale: graphql`
    fragment ScaleActions_scale on TemplateScale {
      id
      isStarter
      teamId
    }
  `
})
