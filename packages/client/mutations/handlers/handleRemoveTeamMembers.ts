import fromTeamMemberId from '../../utils/relay/fromTeamMemberId'
import safeRemoveNodeFromArray from '../../utils/relay/safeRemoveNodeFromArray'
import pluralizeHandler from './pluralizeHandler'

const handleRemoveTeamMember = (teamMemberId: string, store) => {
  const teamMember = store.get(teamMemberId)
  if (!teamMember) return
  const {teamId} = fromTeamMemberId(teamMemberId)
  const team = store.get(teamId)
  safeRemoveNodeFromArray(teamMemberId, team, 'teamMembers', {
    storageKeyArgs: {sortBy: 'preferredName'}
  })
}

const handleRemoveTeamMembers = pluralizeHandler(handleRemoveTeamMember)
export default handleRemoveTeamMembers
