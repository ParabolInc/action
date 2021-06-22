import {getTeamByTeamIdQuery, IGetTeamByTeamIdQueryResult} from './generated/getTeamByTeamIdQuery'
import catchAndLog from '../utils/catchAndLog'
import getPg from '../getPg'

const getTeamByTeamId = async (teamId: string): Promise<IGetTeamByTeamIdQueryResult> => {
  const teams = await catchAndLog(() => getTeamByTeamIdQuery.run({id: teamId}, getPg()))
  return teams[0]
}

export default getTeamByTeamId
