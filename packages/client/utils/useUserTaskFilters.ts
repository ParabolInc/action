import useRouter from '~/hooks/useRouter'
import {useMemo} from 'react'

const useUserTaskFilters = (viewerId: string) => {
  const {location} = useRouter()
  return useMemo(() => parseUserTaskFilterQueryParams(viewerId, location), [viewerId, location])
}

const parseUserTaskFilterQueryParams = (viewerId: string, location) => {
  const parsed = new URLSearchParams(location.search)
  const teamIds = parsed.has('teamIds') ? (parsed.get('teamIds') as string).split(',') : null
  const userIdsArray = parsed.has('userIds') ? (parsed.get('userIds') as string).split(',') : null
  const userIds = userIdsArray || (teamIds ? null : [viewerId])
  const showArchived = !!parsed.get('archived')
  return {userIds, teamIds, showArchived}
}

export {parseUserTaskFilterQueryParams, useUserTaskFilters}
