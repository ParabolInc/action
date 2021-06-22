import getPg from '../getPg'
import {
  getGitHubAuthByUserIdTeamIdQuery,
  IGetGitHubAuthByUserIdTeamIdQueryResult
} from './generated/getGitHubAuthByUserIdTeamIdQuery'

// this table has a composite primary key (userId, teamId),
// which cannot use the index with a WHERE IN or JOIN on VALUES
// so if we want to query multiple userIds/teamIds, just call this multiple times
export interface GetGitHubAuthByUserIdTeamIdResult extends IGetGitHubAuthByUserIdTeamIdQueryResult {
  isActive: true
}
const getGitHubAuthByUserIdTeamId = async (userId: string, teamId: string) => {
  const [res] = await getGitHubAuthByUserIdTeamIdQuery.run({teamId, userId}, getPg())
  return res as GetGitHubAuthByUserIdTeamIdResult
}
export default getGitHubAuthByUserIdTeamId
