/**
 * Display a pop-up to show help content per meeting phase.
 *
 * @flow
 */

import React from 'react'
import styled from 'react-emotion'
import LoadableMeetingHelpDialogMenu from 'universal/modules/meeting/components/MeetingHelpDialog/LoadableMeetingHelpDialogMenu'
import LoadableMenu from 'universal/components/LoadableMenu'
import RaisedButton from 'universal/components/RaisedButton'
import IconLabel from 'universal/components/IconLabel'

type Props = {
  phase: string
}

const Button = styled(RaisedButton)({
  paddingLeft: 0,
  paddingRight: 0,
  width: '2rem'
})

const originAnchor = {
  vertical: 'bottom',
  horizontal: 'right'
}

const targetAnchor = {
  vertical: 'bottom',
  horizontal: 'right'
}

const MeetingHelpDialog = ({phase}: Props) => {
  const iconButtonToggle = (
    <Button palette='white' depth={2}>
      <IconLabel icon='question' />
    </Button>
  )

  return (
    <LoadableMenu
      LoadableComponent={LoadableMeetingHelpDialogMenu}
      maxWidth={280}
      maxHeight={320}
      originAnchor={originAnchor}
      queryVars={{phase}}
      targetAnchor={targetAnchor}
      toggle={iconButtonToggle}
    />
  )
}

export default MeetingHelpDialog
