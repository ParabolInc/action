import {ConnectionHandler, RecordProxy} from 'relay-runtime'

const getArchivedTasksConn = (viewer: RecordProxy, userIds: string[] | null, teamIds: string[] | null) =>
  ConnectionHandler.getConnection(viewer, 'TeamArchive_archivedTasks', {userIds, teamIds})

export default getArchivedTasksConn
