import {ConnectionHandler, ReadOnlyRecordProxy} from 'relay-runtime'

const getJiraIssuesConn = (
  viewer: ReadOnlyRecordProxy | null | undefined,
  isJql: boolean | undefined,
  queryString: string | undefined,
  projectKeyFilters: string[] | undefined
) => {
  if (viewer) {
    return ConnectionHandler.getConnection(viewer, 'JiraScopingSearchResults_issues', {
      isJQL: isJql || false,
      projectKeyFilters: projectKeyFilters || [],
      queryString: queryString || ''
    })
  }
  return null
}

export default getJiraIssuesConn
