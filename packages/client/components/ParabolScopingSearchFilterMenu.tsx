import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import {ParabolSearchQuery} from '~/types/clientSchema'
import {taskScopingStatusFilters} from '~/utils/constants'
import {MenuProps} from '../hooks/useMenu'
import {ParabolScopingSearchFilterMenu_meeting} from '../__generated__/ParabolScopingSearchFilterMenu_meeting.graphql'
import Checkbox from './Checkbox'
import DropdownMenuLabel from './DropdownMenuLabel'
import Menu from './Menu'
import MenuItem from './MenuItem'
import MenuItemLabel from './MenuItemLabel'

const StyledCheckBox = styled(Checkbox)({
  marginLeft: -8,
  marginRight: 8
})

const FilterLabel = styled(DropdownMenuLabel)({
  borderBottom: 0
})

interface Props {
  menuProps: MenuProps
  meeting: ParabolScopingSearchFilterMenu_meeting
}

const ParabolScopingSearchFilterMenu = (props: Props) => {
  const {meeting, menuProps} = props
  const {portalStatus, isDropdown} = menuProps
  const {parabolSearchQuery, id: meetingId} = meeting
  const {statusFilters} = parabolSearchQuery
  const atmosphere = useAtmosphere()
  return (
    <Menu
      keepParentFocus
      ariaLabel={'Define the Parabol search query'}
      portalStatus={portalStatus}
      isDropdown={isDropdown}
    >
      <FilterLabel>Filter by status:</FilterLabel>
      {taskScopingStatusFilters.map((status) => {
        const toggleStatusFilter = () => {
          commitLocalUpdate(atmosphere, (store) => {
            const meeting = store.get(meetingId)!
            const parabolSearchQuery = meeting.getLinkedRecord<ParabolSearchQuery>(
              'parabolSearchQuery'
            )
            const statusFiltersProxy = parabolSearchQuery.getValue('statusFilters').slice()
            const keyIdx = statusFiltersProxy.indexOf(status)
            keyIdx !== -1 ? statusFiltersProxy.splice(keyIdx, 1) : statusFiltersProxy.push(status)
            parabolSearchQuery.setValue(statusFiltersProxy, 'statusFilters')
          })
        }
        return (
          <MenuItem
            key={status}
            label={
              <MenuItemLabel>
                <StyledCheckBox active={statusFilters?.includes(status) ?? null} />
                {status}
              </MenuItemLabel>
            }
            onClick={toggleStatusFilter}
          />
        )
      })}
    </Menu>
  )
}

export default createFragmentContainer(ParabolScopingSearchFilterMenu, {
  meeting: graphql`
    fragment ParabolScopingSearchFilterMenu_meeting on PokerMeeting {
      id
      parabolSearchQuery {
        queryString
        statusFilters
      }
    }
  `
})
