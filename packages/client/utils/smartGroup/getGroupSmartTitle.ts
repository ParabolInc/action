/*
 * Takes a guess at what the cards are talking about.
 * If that fails, just gives them a generic name
 */
import computeDistanceMatrix from './computeDistanceMatrix'
import getAllLemmasFromReflections from './getAllLemmasFromReflections'
import getTitleFromComputedGroup from './getTitleFromComputedGroup'

const getGroupSmartTitle = (reflections: {entities: any[]}[]) => {
  const allReflectionEntities = reflections.map(({entities}) => entities).filter(Boolean)
  const uniqueLemmaArr = getAllLemmasFromReflections(allReflectionEntities)

  // create a distance vector for each reflection
  const distanceMatrix = computeDistanceMatrix(allReflectionEntities, uniqueLemmaArr)
  // need to filter out the current group if we want to check for dupes. but a dupe is good, it makes it obvious they should be merged
  return getTitleFromComputedGroup(
    uniqueLemmaArr,
    distanceMatrix,
    allReflectionEntities,
    reflections
  )
}

export default getGroupSmartTitle
