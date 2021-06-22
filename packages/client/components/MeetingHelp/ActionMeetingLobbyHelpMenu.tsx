import React, {forwardRef} from 'react'
import useSegmentTrack from '../../hooks/useSegmentTrack'
import {ExternalLinks} from '../../types/constEnums'
import HelpMenuContent from './HelpMenuContent'
import HelpMenuCopy from './HelpMenuCopy'
import HelpMenuLink from './HelpMenuLink'

interface Props {}

const ActionMeetingLobbyHelpMenu = forwardRef((_props: Props, ref: any) => {
  const {closePortal} = ref
  useSegmentTrack('Help Menu Open', {phase: 'lobby'})
  return (
    <HelpMenuContent closePortal={closePortal}>
      <HelpMenuCopy>{'To learn more about how to run a Check-in Meeting, see our '}</HelpMenuCopy>
      <div>
        <HelpMenuLink copy='Getting Started Guide' href={ExternalLinks.GETTING_STARTED_CHECK_INS} />
        {' for running a Check-in Meeting.'}
      </div>
    </HelpMenuContent>
  )
})

export default ActionMeetingLobbyHelpMenu
