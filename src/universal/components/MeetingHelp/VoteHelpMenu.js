import React from 'react'
import {VOTE} from 'universal/utils/constants'
import HelpMenuContent from 'universal/components/MeetingHelp/HelpMenuContent'
import HelpMenuHeader from 'universal/components/MeetingHelp/HelpMenuHeader'
import HelpMenuCopy from 'universal/components/MeetingHelp/HelpMenuCopy'
import {phaseLabelLookup} from 'universal/utils/meetings/lookups'
import withHelpMenu from 'universal/components/MeetingHelp/withHelpMenu'
import HelpMenuLink from 'universal/components/MeetingHelp/HelpMenuLink'

const VoteHelpMenu = ({closePortal}) => (
  <HelpMenuContent closePortal={closePortal}>
    <HelpMenuHeader>{phaseLabelLookup[VOTE]}</HelpMenuHeader>
    <HelpMenuCopy>
      The goal of this phase is to find signal on what topics are the most important to the team.
    </HelpMenuCopy>
    <HelpMenuCopy>
      Each teammate has 5 total votes, and can vote on a single theme up to 3 times.
    </HelpMenuCopy>
    <HelpMenuCopy>
      To vote, simply tap on the check icon above the card. Toggle votes to remove.
    </HelpMenuCopy>
    <HelpMenuLink
      copy='Learn More'
      href='https://www.parabol.co/getting-started-guide/retrospective-meetings-101#vote'
    />
  </HelpMenuContent>
)

export default withHelpMenu(VoteHelpMenu)
