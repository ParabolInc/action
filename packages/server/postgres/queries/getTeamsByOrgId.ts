import {
  getTeamsByOrgIdQuery,
  IGetTeamsByOrgIdQueryParams,
  IGetTeamsByOrgIdQueryResult
} from './generated/getTeamsByOrgIdQuery'
import getPg from '../getPg'
import catchAndLog from '../utils/catchAndLog'

const getTeamsByOrgId = async (
  orgIds: string | string[],
  options: Partial<Omit<IGetTeamsByOrgIdQueryParams, 'orgId'>> = {}
): Promise<IGetTeamsByOrgIdQueryResult[]> => {
  orgIds = typeof orgIds === 'string' ? [orgIds] : orgIds
  return await catchAndLog(() =>
    getTeamsByOrgIdQuery.run(
      {
        orgIds,
        ...options
      } as IGetTeamsByOrgIdQueryParams,
      getPg()
    )
  )
}

export default getTeamsByOrgId
