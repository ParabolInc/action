const getDeletedEmail = (userId) => `DELETED:${userId}:${new Date()}`
export default getDeletedEmail
