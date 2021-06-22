import {removeUserTmsQuery} from './generated/removeUserTmsQuery'
import getPg from '../getPg'
import catchAndLog from '../utils/catchAndLog'

const removeUserTms = async (teamIdsToRemove: string | string[], userIds: string | string[]) => {
  userIds = typeof userIds === 'string' ? [userIds] : userIds
  teamIdsToRemove = typeof teamIdsToRemove === 'string' ? [teamIdsToRemove] : teamIdsToRemove
  await catchAndLog(() =>
    removeUserTmsQuery.run(
      {
        ids: userIds as string[],
        teamIds: teamIdsToRemove as string[]
      },
      getPg()
    )
  )
}

export default removeUserTms
