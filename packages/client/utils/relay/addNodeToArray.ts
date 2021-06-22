import {RecordProxy, Variables} from 'relay-runtime'

export const getDescendingIdx = (
  newName: string | number,
  arr: (RecordProxy | null)[],
  sortValue: string
) => {
  let nextIdx
  for (nextIdx = 0; nextIdx < arr.length; nextIdx++) {
    const node = arr[nextIdx]
    if (!node) continue
    const nodeName = node.getValue(sortValue) as string | number
    if (nodeName < newName) break
  }
  return nextIdx
}

export const getAscendingIdx = (
  newName: string | number,
  arr: (RecordProxy | null)[],
  sortValue: string
) => {
  let nextIdx
  for (nextIdx = 0; nextIdx < arr.length; nextIdx++) {
    const node = arr[nextIdx]
    if (!node) continue
    const nodeName = node.getValue(sortValue) as string | number
    if (nodeName > newName) break
  }
  return nextIdx
}

interface Options {
  descending?: boolean
  storageKeyArgs?: Variables
}
const addNodeToArray = (
  newNode: RecordProxy | null | undefined,
  parent: RecordProxy | null | undefined,
  arrayName: string,
  sortValue?: string,
  options: Options = {}
) => {
  if (!newNode || !parent) return
  const {descending, storageKeyArgs} = options
  // create an empty array so we don't have to make sure all of our mutations are bullet proof.
  // alternative is to test every page pre & post refresh, which would suck
  const arr = parent.getLinkedRecords(arrayName, storageKeyArgs) || []
  if (!arr) return
  const nodeDataId = newNode.getDataID()
  // rule out duplicates
  for (let ii = 0; ii < arr.length; ii++) {
    const node = arr[ii]
    if (node && node.getDataID() === nodeDataId) return
  }
  const newName = sortValue ? newNode.getValue(sortValue) as string | number : ''
  const idxFinder = descending ? getDescendingIdx : getAscendingIdx
  const nextIdx = sortValue ? idxFinder(newName, arr, sortValue) : descending ? arr.length - 1 : 0
  const newArr = [...arr.slice(0, nextIdx), newNode, ...arr.slice(nextIdx)]
  parent.setLinkedRecords(newArr, arrayName, storageKeyArgs)
}

export default addNodeToArray
