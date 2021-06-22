let tempId = 0
const clientTempId = (prefix?: string) => {
  const prefixWithSeparator = prefix ? `${prefix}::` : ''
  return `${prefixWithSeparator}${Date.now()}-${tempId++}-tmp`
}
export default clientTempId
