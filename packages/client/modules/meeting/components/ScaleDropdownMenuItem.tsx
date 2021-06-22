import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {forwardRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import textOverflow from '~/styles/helpers/textOverflow'
import {PALETTE} from '~/styles/paletteV3'
import {FONT_FAMILY} from '~/styles/typographyV2'
import Icon from '../../../components/Icon'
import MenuItem from '../../../components/MenuItem'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import UpdatePokerTemplateDimensionScaleMutation from '../../../mutations/UpdatePokerTemplateDimensionScaleMutation'
import {ScaleDropdownMenuItem_dimension} from '../../../__generated__/ScaleDropdownMenuItem_dimension.graphql'
import {ScaleDropdownMenuItem_scale} from '../../../__generated__/ScaleDropdownMenuItem_scale.graphql'
import ScaleActions from './ScaleActions'
import scaleValueString from './scaleValueString'

interface Props {
  scale: ScaleDropdownMenuItem_scale
  scaleCount: number
  dimension: ScaleDropdownMenuItem_dimension
  closePortal: () => void
}

const ScaleDetails = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  minWidth: '300px'
})

const ScaleNameAndValues = styled('div')({
  display: 'block',
  flexDirection: 'column',
  maxWidth: '200px',
  paddingTop: 12,
  paddingLeft: 16,
  paddingBottom: 12,
  flexGrow: 1
})

const ScaleName = styled('div')({
  ...textOverflow,
  color: PALETTE.SLATE_700,
  display: 'flex',
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontSize: 16,
  fontWeight: 600,
  lineHeight: '24px'
})

const ScaleValues = styled('div')({
  ...textOverflow,
  color: PALETTE.SLATE_600,
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontSize: 12,
  lineHeight: '16px'
})

const ScaleActionButtonGroup = styled('div')({
  paddingLeft: '8px',
  paddingRight: '8px',
  marginTop: 'auto',
  marginBottom: 'auto'
})

const StarterIcon = styled(Icon)({
  fontSize: 18,
  lineHeight: '24px',
  paddingLeft: 4
})

const ScaleDropdownMenuItem = forwardRef((props: Props, ref) => {
  const {scale, dimension, closePortal, scaleCount} = props
  const {id: scaleId, isStarter, name: scaleName, values} = scale
  const {id: dimensionId, selectedScale} = dimension
  const {id: selectedScaleId} = selectedScale
  const atmosphere = useAtmosphere()
  const {submitMutation, submitting, onError, onCompleted} = useMutationProps()

  const setScale = (scaleId: any) => () => {
    if (submitting || scaleId === selectedScaleId) return
    submitMutation()
    UpdatePokerTemplateDimensionScaleMutation(atmosphere, {dimensionId, scaleId}, {onError, onCompleted})
    closePortal()
  }

  return (
    <MenuItem
      ref={ref}
      onClick={setScale(scaleId)}
      label={
        <ScaleDetails>
          <ScaleNameAndValues >
            <ScaleName>
              {scaleName}
              {isStarter && <StarterIcon>public</StarterIcon>}
            </ScaleName>
            <ScaleValues>
              {scaleValueString(values)}
            </ScaleValues>
          </ScaleNameAndValues>
          <ScaleActionButtonGroup>
            <ScaleActions
              scale={scale}
              scaleCount={scaleCount}
              teamId={dimension.team.id}
            />
          </ScaleActionButtonGroup>
        </ScaleDetails>
      }
    />
  )
})

export default createFragmentContainer(ScaleDropdownMenuItem, {
  dimension: graphql`
    fragment ScaleDropdownMenuItem_dimension on TemplateDimension {
      id
      selectedScale {
        id
      }
      team {
        id
      }
    }
  `,
  scale: graphql`
    fragment ScaleDropdownMenuItem_scale on TemplateScale {
      ...ScaleActions_scale
      id
      name
      isStarter
      teamId
      values {
        label
      }
    }
  `
})
