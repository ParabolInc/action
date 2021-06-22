import getRedis from './getRedis'

export const enum RedisCommand {
  ADD = 'sadd',
  REMOVE = 'srem'
}

const getListeningUserIds = async (command: RedisCommand, tms: string[], userId: string) => {
  const redis = getRedis()
  const listeningUserIds = new Set()
  const commands = [] as string[][]
  for (const teamId of tms) {
    commands.push([command, `team:${teamId}`, userId], ['smembers', `team:${teamId}`])
  }
  const responses = await redis.multi(commands).exec((execErr) => {
    if (execErr) {
      throw new Error(`Failed to execute redis command: ${execErr}`)
    }
  })
  const membersOfAllTeams = [] as string[]
  responses.forEach((res, index) => {
    // responses include both add/remove userId command and smembers command
    // we only want to read smembers so check if index is odd
    if (index % 2 !== 0) {
      const teamMembers = res[1] as string[]
      membersOfAllTeams.push(...teamMembers)
    }
  })
  for (const teamMemberUserId of membersOfAllTeams) {
    listeningUserIds.add(teamMemberUserId)
  }
  return Array.from(listeningUserIds) as string[]
}

export default getListeningUserIds
