import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useBreakpoint from '~/hooks/useBreakpoint'
import {MenuPosition} from '~/hooks/useCoords'
import useMenu from '~/hooks/useMenu'
import {Elevation} from '~/styles/elevation'
import {PALETTE} from '~/styles/paletteV3'
import {Breakpoint} from '~/types/constEnums'
import plural from '~/utils/plural'
import {NewMeetingActionsCurrentMeetings_team} from '~/__generated__/NewMeetingActionsCurrentMeetings_team.graphql'
import FlatButton from './FlatButton'
import Icon from './Icon'
import SelectMeetingDropdown from './SelectMeetingDropdown'
import useSnacksForNewMeetings from '~/hooks/useSnacksForNewMeetings'

const CurrentButton = styled(FlatButton)<{hasMeetings: boolean}>(({hasMeetings}) => ({
  color: PALETTE.ROSE_500,
  fontSize: 14,
  fontWeight: 600,
  padding: '4px 16px',
  marginBottom: 24,
  ':hover': {
    backgroundColor: '#fff',
    boxShadow: Elevation.BUTTON_RAISED
  },
  visibility: hasMeetings ? undefined : 'hidden'
}))

const ForumIcon = styled(Icon)({
  paddingRight: 12
})

interface Props {
  team: NewMeetingActionsCurrentMeetings_team
}

const NewMeetingActionsCurrentMeetings = (props: Props) => {
  const {team} = props
  const isDesktop = useBreakpoint(Breakpoint.NEW_MEETING_GRID)
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu<HTMLButtonElement>(
    MenuPosition.LOWER_RIGHT,
    {isDropdown: true}
  )
  const {activeMeetings} = team
  useSnacksForNewMeetings(activeMeetings)
  const meetingCount = activeMeetings.length
  const label = `${meetingCount} Active ${plural(meetingCount, 'Meeting')}`
  if (meetingCount === 0 && !isDesktop) return null
  return (
    <>
      <CurrentButton
        onClick={togglePortal}
        ref={originRef}
        hasMeetings={meetingCount > 0}
        size={'large'}
      >
        <ForumIcon>forum</ForumIcon>
        {label}
      </CurrentButton>
      {menuPortal(<SelectMeetingDropdown menuProps={menuProps} meetings={activeMeetings!} />)}
    </>
  )
}

export default createFragmentContainer(NewMeetingActionsCurrentMeetings, {
  team: graphql`
    fragment NewMeetingActionsCurrentMeetings_team on Team {
      id
      activeMeetings {
        ...SelectMeetingDropdown_meetings
        ...useSnacksForNewMeetings_meetings
        id
      }
    }
  `
})
