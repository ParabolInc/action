import {RecordSourceSelectorProxy} from 'relay-runtime'
import pluralizeHandler from './pluralizeHandler'
import safeRemoveNodeFromArray from '~/utils/relay/safeRemoveNodeFromArray'

const handleRemovePokerTemplateDimension = (
  dimensionId: string,
  teamId: string,
  store: RecordSourceSelectorProxy
) => {
  const team = store.get(teamId)!
  const settings = team.getLinkedRecord('meetingSettings', {
    meetingType: 'poker'
  })
  if (!settings) return
  const activeTemplate = settings.getLinkedRecord('activeTemplate')
  if (!activeTemplate) return
  safeRemoveNodeFromArray(dimensionId, activeTemplate, 'dimensions')
}

const handleRemovePokerTemplateDimensions = pluralizeHandler(handleRemovePokerTemplateDimension)
export default handleRemovePokerTemplateDimensions
