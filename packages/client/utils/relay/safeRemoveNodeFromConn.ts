import {ConnectionHandler, RecordProxy} from 'relay-runtime'

const safeRemoveNodeFromConn = (nodeId: string, conn: RecordProxy | null | undefined) => {
  if (conn) {
    ConnectionHandler.deleteNode(conn, nodeId)
  }
}

export default safeRemoveNodeFromConn
