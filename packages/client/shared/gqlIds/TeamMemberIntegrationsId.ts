const TeamMemberIntegrationsId = {
  join: (teamId: string, userId: string) => `integrations:${teamId}:${userId}`,
  split: (id: string) => {
    const [, teamId, userId] = id.split(':')
    return {teamId, userId}
  }
}

export default TeamMemberIntegrationsId
