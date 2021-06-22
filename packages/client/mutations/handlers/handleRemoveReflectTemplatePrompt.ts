import {RecordSourceSelectorProxy} from 'relay-runtime'
import pluralizeHandler from './pluralizeHandler'
import safeRemoveNodeFromArray from '~/utils/relay/safeRemoveNodeFromArray'

const handleRemoveReflectTemplatePrompt = (
  promptId: string,
  teamId: string,
  store: RecordSourceSelectorProxy
) => {
  const team = store.get(teamId)!
  const settings = team.getLinkedRecord('meetingSettings', {
    meetingType: 'retrospective'
  })
  if (!settings) return
  const activeTemplate = settings.getLinkedRecord('activeTemplate')
  if (!activeTemplate) return
  safeRemoveNodeFromArray(promptId, activeTemplate, 'prompts')
}

const handleRemoveReflectTemplatePrompts = pluralizeHandler(handleRemoveReflectTemplatePrompt)
export default handleRemoveReflectTemplatePrompts
