const promiseAllObj = async (promiseObj: {[val: string]: Promise<any>}) => {
  const keys = Object.keys(promiseObj)
  const promises = Object.values(promiseObj)
  const values = await Promise.all(promises)
  return values.reduce((newObj, value, idx) => {
    newObj[keys[idx]] = value
    return newObj
  }, {})
}

export default promiseAllObj
