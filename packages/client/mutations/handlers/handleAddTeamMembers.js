import addNodeToArray from '../../utils/relay/addNodeToArray'
import fromTeamMemberId from '../../utils/relay/fromTeamMemberId'
import pluralizeHandler from './pluralizeHandler'

const handleAddTeamMember = (teamMember, store) => {
  const {teamId} = fromTeamMemberId(teamMember.getValue('id'))
  const team = store.get(teamId)
  addNodeToArray(teamMember, team, 'teamMembers', 'preferredName', {
    storageKeyArgs: {sortBy: 'preferredName'}
  })
}

const handleAddTeamMembers = pluralizeHandler(handleAddTeamMember)
export default handleAddTeamMembers
