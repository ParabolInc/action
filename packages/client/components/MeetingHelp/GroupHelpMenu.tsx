import React, {forwardRef} from 'react'
import useSegmentTrack from '../../hooks/useSegmentTrack'
import {ExternalLinks} from '../../types/constEnums'
import {GROUP} from '../../utils/constants'
import {phaseLabelLookup} from '../../utils/meetings/lookups'
import HelpMenuContent from './HelpMenuContent'
import HelpMenuCopy from './HelpMenuCopy'
import HelpMenuHeader from './HelpMenuHeader'
import HelpMenuLink from './HelpMenuLink'

interface Props {}

const GroupHelpMenu = forwardRef((_props: Props, ref: any) => {
  const {closePortal} = ref
  useSegmentTrack('Help Menu Open', {phase: 'group'})
  return (
    <HelpMenuContent closePortal={closePortal}>
      <HelpMenuHeader>{phaseLabelLookup[GROUP]}</HelpMenuHeader>
      <HelpMenuCopy>
        The goal of this phase is to identify common themes and group them for discussion.
      </HelpMenuCopy>
      <HelpMenuCopy>To group, drag and drop a card onto another card or group.</HelpMenuCopy>
      <HelpMenuCopy>Tap group headings to edit.</HelpMenuCopy>
      <HelpMenuLink copy='Learn More' href={`${ExternalLinks.GETTING_STARTED_RETROS}#group`} />
    </HelpMenuContent>
  )
})

export default GroupHelpMenu
