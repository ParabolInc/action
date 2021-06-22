import React, {forwardRef} from 'react'
import useSegmentTrack from '../../hooks/useSegmentTrack'
import {ExternalLinks} from '../../types/constEnums'
import {phaseLabelLookup} from '../../utils/meetings/lookups'
import HelpMenuContent from './HelpMenuContent'
import HelpMenuCopy from './HelpMenuCopy'
import HelpMenuHeader from './HelpMenuHeader'
import HelpMenuLink from './HelpMenuLink'

interface Props {}

const ScopeHelpMenu = forwardRef((_props: Props, ref: any) => {
  const {closePortal} = ref
  useSegmentTrack('Help Menu Open', {phase: 'lobby'})
  return (
    <HelpMenuContent closePortal={closePortal}>
      <HelpMenuHeader>{phaseLabelLookup.SCOPE}</HelpMenuHeader>
      <HelpMenuCopy>The goal here is to select the tasks you‘d like to estimate.</HelpMenuCopy>
      <HelpMenuCopy>
        As a group, you can vote on the value of each task across dimensions (effort, value, etc.)
      </HelpMenuCopy>
      <HelpMenuCopy>
        To save time, you can complete this phase asynchronously, before inviting others
      </HelpMenuCopy>
      <HelpMenuLink
        copy='Learn More'
        href={`${ExternalLinks.GETTING_STARTED_SPRINT_POKER}#scope`}
      />
    </HelpMenuContent>
  )
})

export default ScopeHelpMenu
