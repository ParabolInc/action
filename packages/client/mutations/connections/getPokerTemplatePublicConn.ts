import {ConnectionHandler, ReadOnlyRecordProxy} from 'relay-runtime'

const getPokerTemplatePublicConn = (pokerSettings: ReadOnlyRecordProxy | null | undefined) => {
  if (pokerSettings) {
    return ConnectionHandler.getConnection(pokerSettings, 'PokerTemplateListPublic_publicTemplates')
  }
  return null
}

export default getPokerTemplatePublicConn
