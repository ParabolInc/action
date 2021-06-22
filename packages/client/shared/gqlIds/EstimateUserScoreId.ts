const EstimateUserScoreId = {
  join: (stageId: string, userId: string) => `score:${stageId}:${userId}`,
  split: (id: string) => {
    const [, stageId, userId] = id.split(':')
    return {stageId, userId}
  }
}

export default EstimateUserScoreId
