const constructUserTaskFilterQueryParamURL = (teamIds: string[] | null, userIds: string[] | null, showArchived?: boolean) => {
  const filters = [] as string[]
  if (teamIds) {
    filters.push(`teamIds=${teamIds.join(',')}`)
  }
  if (userIds) {
    filters.push(`userIds=${userIds.join(',')}`)
  }
  if (showArchived) {
    filters.push(`archived=true`)
  }
  const prefix = `/me/tasks${filters.length > 0 ? '?' : ''}`

  return `${prefix}${filters.join('&')}`
}

export default constructUserTaskFilterQueryParamURL