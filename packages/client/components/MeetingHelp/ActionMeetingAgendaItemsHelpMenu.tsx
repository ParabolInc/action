import React, {forwardRef} from 'react'
import useSegmentTrack from '../../hooks/useSegmentTrack'
import {ExternalLinks} from '../../types/constEnums'
import HelpMenuContent from './HelpMenuContent'
import HelpMenuCopy from './HelpMenuCopy'
import HelpMenuLink from './HelpMenuLink'

interface Props {}

const ActionMeetingAgendaItemsHelpMenu = forwardRef((_props: Props, ref: any) => {
  const {closePortal} = ref
  useSegmentTrack('Help Menu Open', {phase: 'firstcall'})
  return (
    <HelpMenuContent closePortal={closePortal}>
      <HelpMenuCopy>
        {
          'The goal of this phase is to identify next steps and capture them as task cards assigned to an owner.'
        }
      </HelpMenuCopy>
      <HelpMenuCopy>
        {
          'Sometimes the next task is to schedule a time to discuss a topic more in depth at a later time.'
        }
      </HelpMenuCopy>
      <HelpMenuLink
        copy='Learn more'
        href={`${ExternalLinks.GETTING_STARTED_CHECK_INS}#team-agenda`}
      />
    </HelpMenuContent>
  )
})

export default ActionMeetingAgendaItemsHelpMenu
