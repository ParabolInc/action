import React, {forwardRef} from 'react'
import useSegmentTrack from '../../hooks/useSegmentTrack'
import {ExternalLinks} from '../../types/constEnums'
import {phaseLabelLookup} from '../../utils/meetings/lookups'
import HelpMenuContent from './HelpMenuContent'
import HelpMenuCopy from './HelpMenuCopy'
import HelpMenuHeader from './HelpMenuHeader'
import HelpMenuLink from './HelpMenuLink'

interface Props {}

const ReflectHelpMenu = forwardRef((_props: Props, ref: any) => {
  const {closePortal} = ref
  useSegmentTrack('Help Menu Open', {phase: 'reflect'})
  return (
    <HelpMenuContent closePortal={closePortal}>
      <HelpMenuHeader>{phaseLabelLookup.reflect}</HelpMenuHeader>
      <HelpMenuCopy>The goal of this phase is to gather honest input from the team.</HelpMenuCopy>
      <HelpMenuCopy>
        As a group, reflect on how work’s going for a specific project or timeframe.
      </HelpMenuCopy>
      <HelpMenuCopy>
        During this phase nobody can see your reflections. After this phase reflections will be
        visible, but remain anonymous.
      </HelpMenuCopy>
      <HelpMenuLink copy='Learn More' href={`${ExternalLinks.GETTING_STARTED_RETROS}#reflect`} />
    </HelpMenuContent>
  )
})

export default ReflectHelpMenu
