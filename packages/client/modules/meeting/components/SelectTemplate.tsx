import {keyframes} from '@emotion/core'
import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import FloatingActionButton from '../../../components/FloatingActionButton'
import Icon from '../../../components/Icon'
import StyledError from '../../../components/StyledError'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import SelectTemplateMutation from '../../../mutations/SelectTemplateMutation'
import {BezierCurve} from '../../../types/constEnums'
import {SelectTemplate_template} from '../../../__generated__/SelectTemplate_template.graphql'

const fadein = keyframes`
0% { opacity: 0; }
100% { opacity: 1; }
`

const ButtonBlock = styled('div')({
  animation: `${fadein} 200ms ${BezierCurve.DECELERATE}`,
  alignItems: 'flex-end',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  pointerEvents: 'none',
  position: 'absolute',
  right: 16,
  bottom: 16,
  width: '100%',
})

const Button = styled(FloatingActionButton)({
  border: 0,
  fontSize: 16,
  padding: '8px 20px',
  pointerEvents: 'all'
})

const StyledIcon = styled(Icon)({
  marginRight: 4
})

interface Props {
  closePortal: () => void
  template: SelectTemplate_template
  teamId: string
}

const SelectTemplate = (props: Props) => {
  const {template, closePortal, teamId} = props
  const {id: templateId} = template
  const atmosphere = useAtmosphere()
  const {submitting, error} = useMutationProps()
  const selectTemplate = () => {
    SelectTemplateMutation(atmosphere, {selectedTemplateId: templateId, teamId})
    closePortal()
  }
  return (
    <ButtonBlock>
      {error && <StyledError>{error.message}</StyledError>}
      <Button onClick={selectTemplate} palette='blue' waiting={submitting}>
        <StyledIcon>check</StyledIcon>
        {'Use Template'}
      </Button>
    </ButtonBlock>
  )
}

export default createFragmentContainer(SelectTemplate, {
  template: graphql`
    fragment SelectTemplate_template on MeetingTemplate {
      id
      teamId
    }
  `
})
