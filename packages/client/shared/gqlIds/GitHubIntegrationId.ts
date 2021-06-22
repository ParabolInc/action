const GitHubIntegrationId = {
  join: (teamId: string, userId: string) => `ghi:${teamId}:${userId}`,
  split: (id: string) => {
    const [, teamId, userId] = id.split(':')
    return {teamId, userId}
  }
}

export default GitHubIntegrationId
