interface RelayEdge {
  node: Record<string, unknown> | null
}

const getNonNullEdges = <T extends RelayEdge | null>(edges: readonly T[]) => {
  const goodEdges = edges.filter((edge) => edge?.node)
  return goodEdges as (NonNullable<T> & {node: NonNullable<NonNullable<T>['node']>})[]
}

export default getNonNullEdges
