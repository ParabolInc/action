const unflattenIntoRows = (items: readonly any[], rowCount: number, columnCount: number) => {
  const rows = new Array(rowCount).fill(undefined)
  rows.forEach((_, idx) => {
    const start = columnCount * idx
    rows[idx] = items.slice(start, start + columnCount)
  })
  return rows
}

export default unflattenIntoRows
