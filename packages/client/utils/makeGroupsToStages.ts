import {DemoReflectionGroup} from '../modules/demo/ClientGraphQLServer'

const mapGroupsToStages = (reflectionGroups: DemoReflectionGroup[]) => {
  const sortedReflectionGroups = reflectionGroups.sort((a, b) =>
    a.voterIds.length < b.voterIds.length ? 1 : -1
  )
  return sortedReflectionGroups
}

export default mapGroupsToStages
