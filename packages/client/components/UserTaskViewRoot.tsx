import React, {lazy} from 'react'
import useAtmosphere from '~/hooks/useAtmosphere'
import useDocumentTitle from '~/hooks/useDocumentTitle'
import {useUserTaskFilters} from '~/utils/useUserTaskFilters'

const MyDashboardTasksRoot = lazy(() =>
  import(/* webpackChunkName: 'MyDashboardTasksRoot' */ '../components/MyDashboardTasksRoot')
)

const ArchiveTasksRoot = lazy(() =>
  import(/* webpackChunkName: 'ArchiveTaskRoot' */ '../components/ArchiveTaskRoot')
)

const UserTaskViewRoot = () => {
  const atmosphere = useAtmosphere()
  const {userIds, teamIds, showArchived} = useUserTaskFilters(atmosphere.viewerId)

  useDocumentTitle('My Tasks | Parabol', 'My Tasks')

  if (showArchived) {
    return <ArchiveTasksRoot userIds={userIds} teamIds={teamIds} team={null} />
  } else {
    return <MyDashboardTasksRoot />
  }

}

export default UserTaskViewRoot