import {RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'

const handleEditReflection = (payload: RecordProxy<any>, store: RecordSourceSelectorProxy<any>) => {
  const promptId = payload.getValue('promptId')
  const isEditing = payload.getValue('isEditing')
  const editorId = payload.getValue('editorId')

  const reflectPrompt = store.get(promptId)
  if (!reflectPrompt) return
  const editorIds = (reflectPrompt.getValue('editorIds') || []) as string[]
  const nextEditorIds = isEditing
    ? Array.from(new Set(editorIds.concat(editorId)))
    : editorIds.filter((id) => id !== editorId)
  reflectPrompt.setValue(nextEditorIds, 'editorIds')
}

export default handleEditReflection
