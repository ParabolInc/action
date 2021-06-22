/* Returns the fewest number of columns that minimizes the number of rows */
const getMinColumns = (maxCols: number, itemCount: number, minCols = 1) => {
  let curCols = maxCols
  let bestRowCount = 1e6
  for (let ii = maxCols; ii >= minCols; ii--) {
    const rowCount = Math.ceil(itemCount / ii)
    if (rowCount <= bestRowCount) {
      curCols = ii
      bestRowCount = rowCount
    } else {
      break
    }
  }
  return {cols: curCols, rowCount: bestRowCount}
}

export default getMinColumns
