const connectionFromTemplateArray = (
  scoredTemplates: {createdAt: Date; id: string}[],
  first: number,
  after: string
) => {
  const startIdx = after ? scoredTemplates.findIndex((template) => template.id === after) : 0
  const safeStartIdx = startIdx === -1 ? 0 : startIdx
  const nodes = scoredTemplates.slice(safeStartIdx, first)
  const edges = nodes.map((node) => ({
    cursor: node.id,
    node
  }))
  const firstEdge = edges[0]
  return {
    edges,
    pageInfo: {
      startCursor: firstEdge && firstEdge.cursor,
      endCursor: firstEdge ? edges[edges.length - 1].cursor : '',
      hasNextPage: scoredTemplates.length > nodes.length
    }
  }
}

export default connectionFromTemplateArray
