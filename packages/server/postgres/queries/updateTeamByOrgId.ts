import catchAndLog from '../../postgres/utils/catchAndLog'
import {
  IUpdateTeamByOrgIdQueryParams,
  updateTeamByOrgIdQuery
} from '../../postgres/queries/generated/updateTeamByOrgIdQuery'
import getPg from '../../postgres/getPg'

const updateTeamByOrgId = async (
  teamUpdates: Partial<IUpdateTeamByOrgIdQueryParams>,
  orgId: string
): Promise<string[]> => {
  const teams = await catchAndLog(() =>
    updateTeamByOrgIdQuery.run(
      {
        ...teamUpdates,
        orgId
      } as IUpdateTeamByOrgIdQueryParams,
      getPg()
    )
  )
  return teams.map(team => team.id)
}

export default updateTeamByOrgId
