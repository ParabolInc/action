import {RecordSourceSelectorProxy} from 'relay-runtime'
import safeRemoveNodeFromArray from '../../utils/relay/safeRemoveNodeFromArray'
import safeRemoveNodeFromConn from '../../utils/relay/safeRemoveNodeFromConn'
import getReflectTemplateOrgConn from '../connections/getReflectTemplateOrgConn'
import getReflectTemplatePublicConn from '../connections/getReflectTemplatePublicConn'
import pluralizeHandler from './pluralizeHandler'

const handleRemoveReflectTemplate = (
  templateId: string,
  teamId: string,
  store: RecordSourceSelectorProxy<any>
) => {
  const team = store.get(teamId)!
  const settings = team.getLinkedRecord('meetingSettings', {
    meetingType: 'retrospective'
  })
  safeRemoveNodeFromArray(templateId, settings, 'teamTemplates')
  const orgConn = getReflectTemplateOrgConn(settings)
  const publicConn = getReflectTemplatePublicConn(settings)
  safeRemoveNodeFromConn(templateId, orgConn)
  safeRemoveNodeFromConn(templateId, publicConn)
}

const handleRemoveReflectTemplates = pluralizeHandler(handleRemoveReflectTemplate)
export default handleRemoveReflectTemplates
