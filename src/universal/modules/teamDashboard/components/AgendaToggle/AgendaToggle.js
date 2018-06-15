import PropTypes from 'prop-types'
import React from 'react'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import ToggleAgendaListMutation from 'universal/mutations/ToggleAgendaListMutation'
import ui from 'universal/styles/ui'
import withMutationProps from 'universal/utils/relay/withMutationProps'
import styled from 'react-emotion'
import {AGENDA_ITEM_LABEL} from 'universal/utils/constants'
// import Button from 'universal/components/Button/Button'
import OutlinedButton from 'universal/components/OutlinedButton'
import FlatButton from 'universal/components/FlatButton'
import IconLabel from 'universal/components/IconLabel'

const RootBlock = styled('div')({
  alignItems: 'flex-end',
  display: 'flex',
  padding: `1rem ${ui.dashGutterSmall}`,
  width: '100%',

  [ui.dashBreakpoint]: {
    padding: `1rem ${ui.dashGutterLarge}`
  }
})

const AgendaToggle = (props) => {
  const {atmosphere, hideAgenda, submitMutation, submitting, onError, onCompleted, teamId} = props
  const toggleHide = () => {
    if (!submitting) {
      submitMutation()
      ToggleAgendaListMutation(atmosphere, teamId, onError, onCompleted)
    }
  }
  const label = `${hideAgenda ? 'See' : 'Hide'} ${AGENDA_ITEM_LABEL}s`
  const buttonProps = {
    buttonSize: 'small',
    buttonPalette: hideAgenda ? 'warm' : 'mid',
    isBlock: true,
    key: `agendaToggleTo${hideAgenda ? 'Show' : 'Hide'}`,
    onClick: toggleHide
  }
  const iconLabel = <IconLabel icon='comments' label={label} />
  return (
    <RootBlock>
      {hideAgenda ? (
        <OutlinedButton {...buttonProps}>{iconLabel}</OutlinedButton>
      ) : (
        <FlatButton {...buttonProps}>{iconLabel}</FlatButton>
      )}
    </RootBlock>
  )
}

// (<Button
//   buttonSize='small'
//   buttonStyle={hideAgenda ? 'outlined' : 'flat'}
//   colorPalette={hideAgenda ? 'warm' : 'mid'}
//   icon='comments'
//   isBlock
//   key={`agendaToggleTo${hideAgenda ? 'Show' : 'Hide'}`}
//   label={label}
//   onClick={toggleHide}
// />)

AgendaToggle.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  hideAgenda: PropTypes.bool,
  onCompleted: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  submitMutation: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  teamId: PropTypes.string
}

export default withMutationProps(withAtmosphere(AgendaToggle))
