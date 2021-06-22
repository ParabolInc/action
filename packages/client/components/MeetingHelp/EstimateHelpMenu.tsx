import React, {forwardRef} from 'react'
import useSegmentTrack from '../../hooks/useSegmentTrack'
import {ExternalLinks} from '../../types/constEnums'
import {phaseLabelLookup} from '../../utils/meetings/lookups'
import HelpMenuContent from './HelpMenuContent'
import HelpMenuCopy from './HelpMenuCopy'
import HelpMenuHeader from './HelpMenuHeader'
import HelpMenuLink from './HelpMenuLink'

interface Props {}

const EstimateHelpMenu = forwardRef((_props: Props, ref: any) => {
  const {closePortal} = ref
  useSegmentTrack('Help Menu Open', {phase: 'ESTIMATE'})
  return (
    <HelpMenuContent closePortal={closePortal}>
      <HelpMenuHeader>{phaseLabelLookup.ESTIMATE}</HelpMenuHeader>
      <HelpMenuCopy>
        Every team member can review the current task and click a card to estimate its value.
      </HelpMenuCopy>
      <HelpMenuCopy>
        Once everyone has played a card, the team can discuss outliers and the facilitator can
        assign a final score.
      </HelpMenuCopy>
      <HelpMenuCopy>
        The final score will be saved to the task and visible in the summary.
      </HelpMenuCopy>
      <HelpMenuLink
        copy='Learn More'
        href={`${ExternalLinks.GETTING_STARTED_SPRINT_POKER}#estimate`}
      />
    </HelpMenuContent>
  )
})

export default EstimateHelpMenu
