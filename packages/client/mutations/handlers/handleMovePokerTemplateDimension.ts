import {RecordSourceProxy} from 'relay-runtime'
import {PokerTemplateDetailsTemplate} from '~/__generated__/PokerTemplateDetailsTemplate.graphql'

const handleMovePokerTemplateDimension = (store: RecordSourceProxy, templateId: string) => {
  const template = store.get<PokerTemplateDetailsTemplate>(templateId)
  if (!template) return
  const dimensions = template.getLinkedRecords('dimensions')
  if (!Array.isArray(dimensions)) return
  dimensions.sort((a, b) => {
    if (!a || !b) return 1
    return a.getValue('sortOrder')! > b.getValue('sortOrder')! ? 1 : -1
  })
  template.setLinkedRecords(dimensions, 'dimensions')
}

export default handleMovePokerTemplateDimension
