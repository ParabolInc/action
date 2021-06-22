import catchAndLog from '../../postgres/utils/catchAndLog'
import {
  IUpdateTeamByTeamIdQueryParams,
  IUpdateTeamByTeamIdQueryResult,
  updateTeamByTeamIdQuery
} from '../../postgres/queries/generated/updateTeamByTeamIdQuery'
import getPg from '../../postgres/getPg'

const updateTeamByTeamId = async (
  teamUpdates: Partial<IUpdateTeamByTeamIdQueryParams>,
  teamId: string
): Promise<IUpdateTeamByTeamIdQueryResult> => {
  const result = await catchAndLog(() =>
    updateTeamByTeamIdQuery.run(
      {
        ...teamUpdates,
        id: teamId
      } as IUpdateTeamByTeamIdQueryParams,
      getPg()
    )
  )
  return result[0]
}

export default updateTeamByTeamId
