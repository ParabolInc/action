import ReflectTemplate from '../../../database/types/ReflectTemplate'
import RetrospectivePrompt from '../../../database/types/RetrospectivePrompt'

interface TemplatePrompt {
  description: string
  groupColor: string
  question: string
  title?: string
  scope?: string
}

interface TemplateObject {
  [templateName: string]: TemplatePrompt[]
}

const makeRetroTemplates = (teamId: string, orgId: string, templateObj: TemplateObject) => {
  const reflectPrompts: RetrospectivePrompt[] = []
  const templates: ReflectTemplate[] = []
  const templateNames = Object.keys(templateObj)
  templateNames.forEach((templateName) => {
    const promptBase = templateObj[templateName]
    const template = new ReflectTemplate({name: templateName, teamId, orgId})

    const prompts = promptBase.map(
      (prompt, idx) =>
        new RetrospectivePrompt({
          teamId,
          templateId: template.id,
          sortOrder: idx,
          question: prompt.question,
          description: prompt.description,
          groupColor: prompt.groupColor,
          title: prompt.title,
          removedAt: null
        })
    )
    templates.push(template)
    reflectPrompts.push(...prompts)
  })
  return {reflectPrompts, templates}
}

export default makeRetroTemplates
