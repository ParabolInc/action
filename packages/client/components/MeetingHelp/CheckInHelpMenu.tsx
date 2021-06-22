import React, {forwardRef} from 'react'
import useSegmentTrack from '../../hooks/useSegmentTrack'
import {ExternalLinks} from '../../types/constEnums'
import {MeetingTypeEnum} from '~/__generated__/NewMeeting_viewer.graphql'
import {phaseLabelLookup} from '../../utils/meetings/lookups'
import HelpMenuContent from './HelpMenuContent'
import HelpMenuCopy from './HelpMenuCopy'
import HelpMenuHeader from './HelpMenuHeader'
import HelpMenuLink from './HelpMenuLink'

const linkLookup = {
  action: `${ExternalLinks.GETTING_STARTED_CHECK_INS}#icebreaker`,
  retrospective: `${ExternalLinks.GETTING_STARTED_RETROS}#icebreaker`
} as Record<MeetingTypeEnum, string>

interface Props {
  meetingType: MeetingTypeEnum
}

const CheckInHelpMenu = forwardRef((props: Props, ref: any) => {
  const {closePortal} = ref
  const {meetingType} = props
  useSegmentTrack('Help Menu Open', {phase: 'checkin'})
  return (
    <HelpMenuContent closePortal={closePortal}>
      <HelpMenuHeader>{phaseLabelLookup.checkin}</HelpMenuHeader>
      <HelpMenuCopy>
        {'The Icebreaker is an opportunity to quickly share some personal context with your team.'}
      </HelpMenuCopy>
      <HelpMenuCopy>
        {'Avoid cross-talk so that everybody can have uninterrupted airtime.'}
      </HelpMenuCopy>
      <HelpMenuLink copy='Learn More' href={linkLookup[meetingType]} />
    </HelpMenuContent>
  )
})

export default CheckInHelpMenu
