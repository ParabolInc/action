import styled from '@emotion/styled'
import React from 'react'
import makeMinWidthMediaQuery from '~/utils/makeMinWidthMediaQuery'
import IconLabel from '../../../../components/IconLabel'
import LinkButton from '../../../../components/LinkButton'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../../../decorators/withAtmosphere/withAtmosphere'
import ToggleAgendaListMutation from '../../../../mutations/ToggleAgendaListMutation'
import {PALETTE} from '../../../../styles/paletteV3'
import {Breakpoint} from '../../../../types/constEnums'
import {CompletedHandler, ErrorHandler} from '../../../../types/relayMutations'
import {AGENDA_ITEM_LABEL} from '../../../../utils/constants'
import withMutationProps, {WithMutationProps} from '../../../../utils/relay/withMutationProps'

const desktopBreakpoint = makeMinWidthMediaQuery(Breakpoint.SIDEBAR_LEFT)

const StyledLinkButton = styled(LinkButton)({
  color: PALETTE.SLATE_600,
  fontWeight: 600,
  height: 24,
  marginTop: 16,
  ':hover, :focus, :active': {
    color: PALETTE.SLATE_700
  },
  [desktopBreakpoint]: {
    marginTop: 0
  }
})

interface Props extends WithMutationProps, WithAtmosphereProps {
  hideAgenda?: boolean
  onCompleted: CompletedHandler
  onError: ErrorHandler
  teamId: string
}

const AgendaToggle = (props: Props) => {
  const {atmosphere, hideAgenda, submitMutation, submitting, onError, onCompleted, teamId} = props
  const toggleHide = () => {
    if (!submitting) {
      submitMutation()
      ToggleAgendaListMutation(atmosphere, teamId, onError, onCompleted)
    }
  }
  const label = `${hideAgenda ? 'See' : 'Hide'} ${AGENDA_ITEM_LABEL}s`
  return (
    <StyledLinkButton key={`agendaToggleTo${hideAgenda ? 'Show' : 'Hide'}`} onClick={toggleHide}>
      <IconLabel icon='comment' iconLarge label={label} />
    </StyledLinkButton>
  )
}

export default withMutationProps(withAtmosphere(AgendaToggle))
