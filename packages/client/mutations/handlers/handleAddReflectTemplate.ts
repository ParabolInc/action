import {RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import addNodeToArray from '../../utils/relay/addNodeToArray'

const handleAddReflectTemplate = (
  newNode: RecordProxy | null,
  store: RecordSourceSelectorProxy
) => {
  if (!newNode) return
  const teamId = newNode.getValue('teamId') as string
  const team = store.get(teamId)
  if (!team) return
  const meetingSettings = team.getLinkedRecord('meetingSettings', {
    meetingType: 'retrospective'
  })
  if (!meetingSettings) return
  addNodeToArray(newNode, meetingSettings, 'teamTemplates', 'name')
}

export default handleAddReflectTemplate
