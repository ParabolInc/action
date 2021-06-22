import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useEffect} from 'react'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import FlatButton from '../../../components/FlatButton'
import Icon from '../../../components/Icon'
import useAtmosphere from '../../../hooks/useAtmosphere'
import textOverflow from '../../../styles/helpers/textOverflow'
import {PALETTE} from '../../../styles/paletteV3'
import {FONT_FAMILY} from '../../../styles/typographyV2'
import {PokerTemplateScaleDetails_team} from '../../../__generated__/PokerTemplateScaleDetails_team.graphql'
import EditableTemplateScaleName from './EditableTemplateScaleName'
import scaleValueString from './scaleValueString'
import TemplateScaleValueList from './TemplateScaleValueList'

const ScaleHeader = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  margin: '16px 0',
  paddingLeft: 56,
  paddingRight: 16,
  width: '100%'
})

const IconButton = styled(FlatButton)({
  alignItems: 'center',
  color: PALETTE.SLATE_600,
  height: 32,
  justifyContent: 'center',
  padding: 0,
  width: 32,
  ':hover, :focus, :active': {
    color: PALETTE.SLATE_700
  }
})

const BackIcon = styled(Icon)({
  color: 'inherit'
})

const ScaleDetailHeader = styled('div')({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  padding: 12
})

const ScaleValueEditor = styled('div')({
  alignItems: 'flex-start',
  background: '#fff',
  borderRadius: 8,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  maxWidth: 520,
  width: '100%'
})

const ScaleNameAndValues = styled('div')({
  alignItems: 'flex-start',
  display: 'flex',
  flexDirection: 'column'
})

const ScaleDetailsTitle = styled('div')({
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontSize: 16,
  fontWeight: 600,
  lineHeight: '32px',
  paddingLeft: 12,
  userSelect: 'none'
})

const ScaleValues = styled('div')({
  ...textOverflow,
  color: PALETTE.SLATE_600,
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontSize: 12,
  lineHeight: '16px',
  paddingTop: '4px'
})

interface Props {
  team: PokerTemplateScaleDetails_team
}

const PokerTemplateScaleDetails = (props: Props) => {
  const {team} = props
  const {id: teamId, scales, editingScaleId} = team
  const scale = scales.find((scale) => scale.id === editingScaleId)!
  const {values} = scale
  const isOwner = scale.teamId === teamId
  const atmosphere = useAtmosphere()
  const gotoTemplateDetail = () => {
    commitLocalUpdate(atmosphere, (store) => {
      store.get(teamId)?.setValue(null, 'editingScaleId')
    })
  }
  useEffect(() => gotoTemplateDetail, [])

  return (
    <ScaleValueEditor>
      <ScaleDetailHeader>
        <IconButton aria-label='Back to Template' onClick={gotoTemplateDetail}>
          <BackIcon>arrow_back</BackIcon>
        </IconButton>
        <ScaleDetailsTitle>{'Edit Scale'}</ScaleDetailsTitle>
      </ScaleDetailHeader>
      <ScaleHeader>
        <ScaleNameAndValues>
          <EditableTemplateScaleName
            name={scale.name}
            scaleId={scale.id}
            scales={scales}
            isOwner={isOwner}
          />
          <ScaleValues>
            {scaleValueString(values)}
          </ScaleValues>
          <ScaleValues>{'Note: all scales include ? and Pass cards'}</ScaleValues>
        </ScaleNameAndValues>
      </ScaleHeader>
      <TemplateScaleValueList scale={scale} isOwner={isOwner} />
    </ScaleValueEditor>
  )
}

export default createFragmentContainer(PokerTemplateScaleDetails, {
  team: graphql`
    fragment PokerTemplateScaleDetails_team on Team {
      id
      editingScaleId
      scales {
        ...EditableTemplateScaleName_scales
        ...TemplateScaleValueList_scale
        ...NewTemplateScaleValueLabelInput_scale
        id
        name
        teamId
        values {
          label
        }
      }
    }
  `
})
