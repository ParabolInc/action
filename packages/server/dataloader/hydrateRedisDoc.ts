import User from '../database/types/User'

const hydrators = {
  publicTemplates: (publicTemplates: any[]) => {
    publicTemplates.forEach((template) => {
      template.createdAt = new Date(template.createdAt)
    })
    return publicTemplates
  },
  User: (user: User) => {
    user.createdAt = new Date(user.createdAt)
    user.lastSeenAt = user.lastSeenAt ? new Date(user.lastSeenAt) : null
    user.updatedAt = new Date(user.updatedAt)
    return user
  }
}

const hydrateRedisDoc = (docStr: string, type: string) => {
  const doc = JSON.parse(docStr)
  const hydrator = hydrators[type]
  if (!hydrator) return doc
  return hydrator(doc)
}

export default hydrateRedisDoc
