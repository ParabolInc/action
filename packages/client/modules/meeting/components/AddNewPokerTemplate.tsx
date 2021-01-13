import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useEffect, useRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import FloatingActionButton from '../../../components/FloatingActionButton'
import Icon from '../../../components/Icon'
import TooltipStyled from '../../../components/TooltipStyled'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import AddPokerTemplateMutation from '../../../mutations/AddPokerTemplateMutation'
import {Threshold} from '../../../types/constEnums'
import {AddNewPokerTemplate_pokerTemplates} from '../../../__generated__/AddNewPokerTemplate_pokerTemplates.graphql'

const ErrorLine = styled(TooltipStyled)({
  margin: '0 0 8px'
})

const ButtonBlock = styled('div')({
  alignItems: 'flex-end',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  padding: '8px 16px 16px 8px',
  position: 'absolute',
  pointerEvents: 'none',
  right: 0,
  bottom: 0,
  width: '100%'
})

const Button = styled(FloatingActionButton)({
  padding: 15,
  pointerEvents: 'all'
})

interface Props {
  gotoTeamTemplates: () => void
  pokerTemplates: AddNewPokerTemplate_pokerTemplates
  teamId: string
}

const AddNewPokerTemplate = (props: Props) => {
  const {gotoTeamTemplates, teamId, pokerTemplates} = props
  const atmosphere = useAtmosphere()
  const {onError, onCompleted, submitMutation, submitting, error} = useMutationProps()
  const errorTimerId = useRef<undefined | number>()
  useEffect(() => {
    return () => {
      window.clearTimeout(errorTimerId.current)
    }
  }, [])
  const addNewTemplate = () => {
    if (submitting) return
    if (pokerTemplates.length >= Threshold.MAX_RETRO_TEAM_TEMPLATES) {
      onError(new Error(`You may only have ${Threshold.MAX_RETRO_TEAM_TEMPLATES} templates per team. Please remove one first.`))
      errorTimerId.current = window.setTimeout(() => {
        onCompleted()
      }, 8000)
      return
    }
    if (pokerTemplates.find((template) => template.name === '*New Template')) {
      onError(new Error('You already have a new template. Try renaming that one first.'))
      errorTimerId.current = window.setTimeout(() => {
        onCompleted()
      }, 8000)
      return
    }
    submitMutation()
    AddPokerTemplateMutation(atmosphere, {teamId}, {onError, onCompleted})
    gotoTeamTemplates()
  }
  return (
    <ButtonBlock>
      {error && <ErrorLine>{error.message}</ErrorLine>}
      <Button onClick={addNewTemplate} palette='blue' waiting={submitting}>
        <Icon>add</Icon>
      </Button>
    </ButtonBlock>
  )
}

export default createFragmentContainer(AddNewPokerTemplate, {
  pokerTemplates: graphql`
    fragment AddNewPokerTemplate_pokerTemplates on PokerTemplate @relay(plural: true) {
      name
    }
  `
})
