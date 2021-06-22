import {ConnectionHandler, ReadOnlyRecordProxy} from 'relay-runtime'

const getPokerTemplateOrgConn = (pokerSettings: ReadOnlyRecordProxy | null | undefined) => {
  if (pokerSettings) {
    return ConnectionHandler.getConnection(pokerSettings, 'PokerTemplateListOrg_organizationTemplates')
  }
  return null
}

export default getPokerTemplateOrgConn
