import getRedis from '../../../utils/getRedis'
import {UserPresence} from '../../intranetSchema/mutations/connectSocket'

// finds all the users who are at the same url
const getUsersToIgnore = async (viewerId: string, teamId: string) => {
  const redis = getRedis()
  const [lrangeRes, sMembersRes] = await redis
    .multi()
    .lrange(`presence:${viewerId}`, 0, -1)
    .smembers(`team:${teamId}`)
    .exec((execErr) => {
      if (execErr) throw new Error(`Failed to execute redis command: ${execErr}`)
    })
  const userPresence = lrangeRes[1]
  const activeTeamMemberIds = sMembersRes[1]
  const parsedUserPresence = userPresence.map((socket) => JSON.parse(socket)) as UserPresence[]
  const userLastSeenAtURLs = parsedUserPresence.map(({lastSeenAtURL}) => lastSeenAtURL)

  const usersAtSameURL = [] as string[]
  const commands = activeTeamMemberIds.map((id) => ['lrange', `presence:${id}`, '0', '-1'])
  await redis.multi(commands).exec((execErr, results) => {
    if (execErr) throw new Error(`Failed to execute redis command: ${execErr}`)
    results.forEach((result, index) => {
      const teamMemberUserPresence = result[1] as string[]
      const teamMemberLastSeenAtURLs = teamMemberUserPresence.map(
        (socket) => JSON.parse(socket).lastSeenAtURL
      )
      const isAtSameURL = teamMemberLastSeenAtURLs.find((url) => userLastSeenAtURLs.includes(url))
      if (isAtSameURL && activeTeamMemberIds) {
        const userId = activeTeamMemberIds[index]
        usersAtSameURL.push(userId)
      }
    })
  })
  return usersAtSameURL
}

export default getUsersToIgnore
