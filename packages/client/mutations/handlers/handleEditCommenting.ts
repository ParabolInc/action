import createProxyRecord from '../../utils/relay/createProxyRecord'

const handleEditTask = (payload, store) => {
  const threadId = payload.getValue('threadId')
  const commentor = payload.getLinkedRecord('commentor')
  const commentorId = commentor.getValue('id')
  const preferredName = commentor.getValue('preferredName')
  const isCommenting = payload.getValue('isCommenting')

  const thread = store.get(threadId)
  if (!thread) return
  const commentors = thread.getLinkedRecords('commentors') || []
  if (!commentors || (commentors.length === 1 && !isCommenting)) {
    thread.setValue(null, 'commentors')
    return
  }

  const newCommentors = [] as any
  for (let ii = 0; ii < commentors.length; ii++) {
    const commentor = commentors[ii]
    if (commentor.getValue('userId') !== commentorId) {
      newCommentors.push(commentor)
    }
  }
  if (isCommenting) {
    const newCommentor = createProxyRecord(store, 'CommentorDetails', {
      userId: commentorId,
      preferredName
    })
    newCommentors.push(newCommentor)
  }

  if (newCommentors) {
    thread.setLinkedRecords(newCommentors, 'commentors')
  } else {
    thread.setValue(null, 'commentors')
  }
}

export default handleEditTask
