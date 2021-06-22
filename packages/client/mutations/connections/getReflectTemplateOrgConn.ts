import {ConnectionHandler, ReadOnlyRecordProxy} from 'relay-runtime'

const getReflectTemplateOrgConn = (retroSettings: ReadOnlyRecordProxy | null | undefined) => {
  if (retroSettings) {
    return ConnectionHandler.getConnection(retroSettings, 'ReflectTemplateListOrg_organizationTemplates')
  }
  return null
}

export default getReflectTemplateOrgConn
