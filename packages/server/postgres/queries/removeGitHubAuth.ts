import getPg from '../getPg'
import {removeGitHubAuthQuery} from './generated/removeGitHubAuthQuery'

const removeGitHubAuth = async (userId: string, teamId: string) => {
  await removeGitHubAuthQuery.run({userId, teamId}, getPg())
}
export default removeGitHubAuth
