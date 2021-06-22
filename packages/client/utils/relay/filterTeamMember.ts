import {commitLocalUpdate} from 'react-relay'
import Atmosphere from '../../Atmosphere'

const filterTeamMember = (atmosphere: Atmosphere, teamId: string, teamMemberId: string | null) => {
  commitLocalUpdate(atmosphere, (store) => {
    const team = store.get(teamId)
    if (!team) return
    const teamMemberFilter = teamMemberId ? store.get(teamMemberId)! : null
    if (teamMemberFilter) {
      team.setLinkedRecord(teamMemberFilter, 'teamMemberFilter')
    } else {
      team.setValue(null, 'teamMemberFilter')
    }
  })
}

export default filterTeamMember
