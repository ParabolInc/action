const JiraServiceTaskId = {
  join: (cloudId: string, issueKey: string) => `${cloudId}:${issueKey}`,
  split: (id: string) => {
    const firstColonIdx = id.indexOf(':')
    const cloudId = id.slice(0, firstColonIdx)
    const issueKey = id.slice(firstColonIdx + 1)
    const projectKey = issueKey.slice(0, issueKey.indexOf('-'))
    return {cloudId, issueKey, projectKey}
  }
}

export default JiraServiceTaskId
