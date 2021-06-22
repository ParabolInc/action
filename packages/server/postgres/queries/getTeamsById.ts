import {getTeamsByIdQuery, IGetTeamsByIdQueryResult} from './generated/getTeamsByIdQuery'
import getPg from '../getPg'
import catchAndLog from '../utils/catchAndLog'

export interface IGetTeamsByIdResult extends IGetTeamsByIdQueryResult {}

const getTeamsById = async (userIds: string[]): Promise<IGetTeamsByIdResult[]> => {
  return await catchAndLog(() => getTeamsByIdQuery.run({ids: userIds}, getPg()))
}

export default getTeamsById
