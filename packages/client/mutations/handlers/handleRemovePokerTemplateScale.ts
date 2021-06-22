import {RecordSourceSelectorProxy} from 'relay-runtime'
import pluralizeHandler from './pluralizeHandler'
import safeRemoveNodeFromArray from '~/utils/relay/safeRemoveNodeFromArray'
import {SprintPokerDefaults} from '../../types/constEnums'

const handleRemovePokerTemplateScale = (
  scaleId: string,
  teamId: string,
  store: RecordSourceSelectorProxy
) => {
  const team = store.get(teamId)!
  safeRemoveNodeFromArray(scaleId, team, 'scales')
  const scale = store.get(scaleId)!
  const dimensionsUsingScale = scale.getLinkedRecords('dimensions')
  const defaultScale = store.get(SprintPokerDefaults.DEFAULT_SCALE_ID)!
  dimensionsUsingScale?.forEach((dimension) => {
    dimension.setLinkedRecord(defaultScale, "selectedScale")
  })
}

const handleRemovePokerTemplateScales = pluralizeHandler(handleRemovePokerTemplateScale)
export default handleRemovePokerTemplateScales
