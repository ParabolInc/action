/*
 * Determine the overall salience of each entity in a group by using a cumulative sum
 * Uses the most salient entities to create a 40-character theme to summarize the content of the reflections
 */

import extractTextFromDraftString from '../draftjs/extractTextFromDraftString'

const SALIENT_THRESHOLD = 0.6
const MIN_ENTITIES = 2
const MAX_CHARS = 30
const MIN_SALIENCE = 0.1

type DistanceArray = number[]
const getNameFromLemma = (lemma: string, reflectionEntities: {lemma?: string, name: string, salience: number}[][]) => {
  const names = new Set<string>()
  reflectionEntities.forEach((entities) => {
    entities.forEach((entity) => {
      if (entity.lemma === lemma) {
        names.add(entity.name)
      }
    })
  })
  names.delete(lemma)
  if (names.size !== 1) return lemma
  return Array.from(names)[0]
}

const getTitleFromComputedGroup = (
  uniqueLemmaArr: string[],
  group: DistanceArray[],
  reflectionEntities: {lemma: string, name: string, salience: number}[][],
  reflections: any[]
) => {
  const sumArr = new Array(uniqueLemmaArr.length).fill(0)
  group.forEach((reflectionDistanceArr) => {
    for (let jj = 0; jj < reflectionDistanceArr.length; jj++) {
      sumArr[jj] += reflectionDistanceArr[jj]
    }
  })

  const arrWithIdx = [] as [number, number][]
  for (let i = 0; i < sumArr.length; i++) {
    arrWithIdx[i] = [sumArr[i], i]
  }
  // add the existing idx & sort greatest to smallest so we can get the most salient entities
  arrWithIdx.sort((a, b) => (a[0] < b[0] ? 1 : -1))
  let cumlSalience = 0
  const titleArr = [] as string[]
  for (let ii = 0; ii < arrWithIdx.length; ii++) {
    const [totalSalience, idx] = arrWithIdx[ii]
    if (totalSalience < MIN_SALIENCE) continue
    const lemma = uniqueLemmaArr[idx]
    const name = getNameFromLemma(lemma, reflectionEntities)
    const capName = name[0].toUpperCase() + name.slice(1)
    // if we've used 2 words & adding this word would make it look long & ugly, abort
    if (titleArr.length > MIN_ENTITIES && titleArr.join(' ').length + capName.length > MAX_CHARS) {
      break
    }
    titleArr.push(capName)
    cumlSalience += totalSalience / group.length
    // if they get the jist, abort
    if (cumlSalience > SALIENT_THRESHOLD) break
  }
  if (titleArr.length === 0) {
    const [firstReflection] = reflections
    if (!firstReflection) return 'Unknown Topic'
    const text = extractTextFromDraftString(firstReflection.content)
    const maxStr = text.trim().slice(0, MAX_CHARS)
    const lastSpace = maxStr.lastIndexOf(' ')
    const wordsOrMax = lastSpace === -1 ? maxStr : maxStr.slice(0, lastSpace).trim()
    return wordsOrMax || 'New Topic' // New Topic should never occur unless str value is falsy
  }
  return titleArr.join(' ')
}

export default getTitleFromComputedGroup
