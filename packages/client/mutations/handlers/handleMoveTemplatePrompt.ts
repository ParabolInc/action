import {RecordSourceProxy} from 'relay-runtime'

const handleMoveTemplatePrompt = (store: RecordSourceProxy, templateId: string) => {
  const template = store.get(templateId)
  if (!template) return
  const prompts = template.getLinkedRecords('prompts')
  if (!Array.isArray(prompts)) return
  prompts.sort((a, b) => {
    if (!a || !b) return 1
    return a.getValue('sortOrder')! > b.getValue('sortOrder')! ? 1 : -1
  })
  template.setLinkedRecords(prompts, 'prompts')
}

export default handleMoveTemplatePrompt
