import getPg from '../getPg'
import {
  IUpsertGitHubAuthQueryParams,
  upsertGitHubAuthQuery
} from './generated/upsertGitHubAuthQuery'

const upsertGitHubAuth = async (auth: IUpsertGitHubAuthQueryParams['auth']) => {
  await upsertGitHubAuthQuery.run({auth}, getPg())
}
export default upsertGitHubAuth
