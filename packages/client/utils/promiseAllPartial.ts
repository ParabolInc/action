// DEPRECATED! We can now use the native Promise.allSettled
/*
 * Promise.all fails fast, which means if promsie 2 of 100 fails, it aborts on 2
 * Sometimes, we want all the results & replace the errors with some generic value like null
 * This does that, and does it quickly, assuming that the first promise in the array will resolve first
 */


import {NotVoid} from '../types/generics'

type CatchHandler = (e: Error) => NotVoid

const defaultCatchHandler: CatchHandler = () => null

const promiseAllPartial = async (
  promiseArr: Promise<any>[],
  catchHandler: CatchHandler = defaultCatchHandler
) => {
  const arr: any[] = []
  for (let ii = 0; ii < promiseArr.length; ii++) {
    const promise = promiseArr[ii]
    try {
      const res = await promise
      arr.push(res)
    } catch (e) {
      const catchValue = catchHandler(e)
      arr.push(catchValue)
    }
  }
  return arr
}

export default promiseAllPartial
