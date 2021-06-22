import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useEffect, useMemo, useRef, useState} from 'react'
import {createPaginationContainer, RelayPaginationProp} from 'react-relay'
import {AutoSizer, CellMeasurer, CellMeasurerCache, Grid, InfiniteLoader} from 'react-virtualized'
import extractTextFromDraftString from '~/utils/draftjs/extractTextFromDraftString'
import getSafeRegex from '~/utils/getSafeRegex'
import toTeamMemberId from '~/utils/relay/toTeamMemberId'
import {TeamArchive_team} from '~/__generated__/TeamArchive_team.graphql'
import {TeamArchive_viewer} from '~/__generated__/TeamArchive_viewer.graphql'
import NullableTask from '../../../../components/NullableTask/NullableTask'
import {PALETTE} from '../../../../styles/paletteV3'
import {Layout, MathEnum} from '../../../../types/constEnums'
import getRallyLink from '../../../userDashboard/helpers/getRallyLink'
import TeamArchiveHeader from '../TeamArchiveHeader/TeamArchiveHeader'

const CARD_WIDTH = 256 + 32 // account for box model and horizontal padding
const GRID_PADDING = 16

const getColumnCount = () => {
  if (typeof window === 'undefined') return 4

  return Math.floor((Layout.TASK_COLUMNS_MAX_WIDTH - GRID_PADDING) / CARD_WIDTH)
}

const getGridIndex = (index: number, columnCount: number) => {
  const rowIndex = Math.floor(index / columnCount)
  const columnIndex = index % columnCount
  return {rowIndex, columnIndex}
}

const Root = styled('div')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  // hide the window scrollbar, the cardGrid scrollbar will mimic the window scrollbar
  overflow: 'hidden',
  width: '100%'
})

const Header = styled('div')({
  padding: `0 0 0 20px`
})

const Border = styled('div')({
  borderTop: `.0625rem solid ${PALETTE.SLATE_300}`,
  height: 1,
  width: '100%'
})

const Body = styled('div')({
  display: 'flex',
  flex: 1,
  height: '100%',
  margin: '0 auto',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  maxWidth: Layout.TASK_COLUMNS_MAX_WIDTH,
  overflow: 'auto',
  padding: `0 10px`,
  width: '100%',
  position: 'relative'
})
const CardGrid = styled('div')({
  border: 0,
  display: 'flex',
  // grow to the largest height possible
  flex: 1,
  outline: 0
})

const EmptyMsg = styled('div')({
  backgroundColor: '#FFFFFF',
  border: `1px solid ${PALETTE.SLATE_400}`,
  borderRadius: 4,
  fontSize: 14,
  display: 'inline-block',
  margin: 20,
  padding: 16
})

const LinkSpan = styled('div')({
  color: PALETTE.AQUA_400
})

interface Props {
  relay: RelayPaginationProp
  viewer: TeamArchive_viewer
  returnToTeamId?: string
  team?: TeamArchive_team
}

const TeamArchive = (props: Props) => {
  const {viewer, relay, team, returnToTeamId} = props
  const {hasMore, isLoading, loadMore} = relay
  const {teamMembers, teamMemberFilter} = team || {}
  const teamMemberFilterId = (teamMemberFilter && teamMemberFilter.id) || null
  const {archivedTasks, dashSearch} = viewer

  const teamMemberFilteredTasks = useMemo(() => {
    const edges = teamMemberFilterId
      ? archivedTasks?.edges.filter((edge) => {
        return (
          edge.node.userId &&
          toTeamMemberId(edge.node.teamId, edge.node.userId) === teamMemberFilterId
        )
      })
      : archivedTasks.edges
    return {...archivedTasks, edges: edges}
  }, [archivedTasks?.edges, teamMemberFilterId, teamMembers])

  const filteredTasks = useMemo(() => {
    if (!dashSearch) return teamMemberFilteredTasks
    const dashSearchRegex = getSafeRegex(dashSearch, 'i')
    const filteredEdges = teamMemberFilteredTasks.edges.filter((edge) =>
      extractTextFromDraftString(edge.node.content).match(dashSearchRegex)
    )
    return {...teamMemberFilteredTasks, edges: filteredEdges}
  }, [dashSearch, teamMemberFilteredTasks])

  const {edges} = filteredTasks
  const [columnCount] = useState(getColumnCount)
  const _onRowsRenderedRef = useRef<
    ({startIndex, stopIndex}: {startIndex: number; stopIndex: number}) => void
  >()
  const gridRef = useRef<any>(null)
  const oldEdgesRef = useRef<typeof edges>()
  const getIndex = (columnIndex: number, rowIndex: number) => {
    return columnCount * rowIndex + columnIndex
  }
  const isRowLoaded = ({index}) => index < edges.length
  const maybeLoadMore = () => {
    if (!hasMore() || isLoading()) return
    loadMore(columnCount * 10)
  }
  const [cellCache] = useState(
    () =>
      new CellMeasurerCache({
        defaultHeight: 182,
        minHeight: 106,
        fixedWidth: true
      })
  )

  const invalidateOnAddRemove = (oldEdges, edges) => {
    if (
      edges &&
      oldEdges &&
      edges !== oldEdges &&
      edges.length !== oldEdges.length &&
      edges.length > 0 &&
      oldEdges.length > 0
    ) {
      const minLen = Math.min(oldEdges.length, edges.length)
      // if a new page is added, don't bother resizing, it isn't from a subscription or mutation
      if (
        oldEdges.length === minLen &&
        oldEdges[minLen - 1].node.id === edges[minLen - 1].node.id
      ) {
        return
      }
      // find the edge that changed. imperatively/efficiently since this can get large
      let ii
      for (ii = 0; ii < minLen; ii++) {
        const oldEdge = oldEdges[ii]
        const newEdge = edges[ii]
        if (oldEdge.node.id !== newEdge.node.id) {
          break
        }
      }
      const {columnIndex, rowIndex} = getGridIndex(ii, columnCount)
      gridRef.current.recomputeGridSize({columnIndex, rowIndex})
      cellCache.clearAll()
    }
  }

  useEffect(() => {
    const {current: oldEdges} = oldEdgesRef
    invalidateOnAddRemove(oldEdges, edges)
    oldEdgesRef.current = edges
  }, [edges, oldEdgesRef])

  const rowRenderer = ({columnIndex, parent, rowIndex, key, style}) => {
    // TODO render a very inexpensive lo-fi card while scrolling. We should reuse that cheap card for drags, too
    const index = getIndex(columnIndex, rowIndex)
    if (!isRowLoaded({index})) return undefined
    const task = edges[index].node
    return (
      <CellMeasurer
        cache={cellCache}
        columnIndex={columnIndex}
        key={key}
        parent={parent}
        rowIndex={rowIndex}
      >
        {({measure}) => {
          return (
            // put styles here because aphrodite is async
            <div
              key={`cardBlockFor${task.id}`}
              style={{...style, width: CARD_WIDTH, padding: '1rem 0.5rem'}}
            >
              <NullableTask
                dataCy={`archive-task`}
                key={key}
                area='teamDash'
                measure={measure}
                task={task}
              />
            </div>
          )
        }}
      </CellMeasurer>
    )
  }

  const _onSectionRendered = ({columnStartIndex, columnStopIndex, rowStartIndex, rowStopIndex}) => {
    if (!_onRowsRenderedRef.current) return
    _onRowsRenderedRef.current({
      startIndex: getIndex(columnStartIndex, rowStartIndex),
      stopIndex: getIndex(columnStopIndex, rowStopIndex)
    })
  }

  return (
    <Root>
      {returnToTeamId && (
        <Header>
          <TeamArchiveHeader teamId={returnToTeamId} />
          <Border />
        </Header>
      )}
      <Body>
        {edges.length ? (
          <CardGrid>
            <InfiniteLoader
              isRowLoaded={isRowLoaded}
              loadMoreRows={maybeLoadMore}
              rowCount={MathEnum.MAX_INT}
            >
              {({onRowsRendered, registerChild}) => {
                _onRowsRenderedRef.current = onRowsRendered
                return (
                  <div style={{flex: '1 1 auto'}}>
                    <AutoSizer>
                      {({height, width}) => {
                        return (
                          <Grid
                            cellRenderer={rowRenderer}
                            columnCount={columnCount}
                            columnWidth={CARD_WIDTH}
                            deferredMeasurementCache={cellCache}
                            estimatedColumnSize={CARD_WIDTH}
                            estimatedRowSize={182}
                            height={height}
                            onRowsRendered={onRowsRendered}
                            onSectionRendered={_onSectionRendered}
                            ref={(c) => {
                              gridRef.current = c
                              registerChild(c)
                            }}
                            rowCount={Math.ceil(edges.length / columnCount)}
                            rowHeight={cellCache.rowHeight}
                            style={{outline: 'none'}}
                            width={width}
                          />
                        )
                      }}
                    </AutoSizer>
                  </div>
                )
              }}
            </InfiniteLoader>
          </CardGrid>
        ) : (
          <EmptyMsg>
            <span>
              {'🤓'}
              {' Hi there! There are zero archived tasks. '}
              {'Nothing to see here. How about a fun rally video? '}
              <LinkSpan>{getRallyLink()}!</LinkSpan>
            </span>
          </EmptyMsg>
        )}
      </Body>
    </Root>
  )
}

export default createPaginationContainer(
  TeamArchive,
  {
    viewer: graphql`
      fragment TeamArchive_viewer on User {
        dashSearch
        archivedTasks: tasks(
          first: $first
          after: $after
          userIds: $userIds
          teamIds: $teamIds
          archived: true
        ) @connection(key: "TeamArchive_archivedTasks", filters: ["userIds", "teamIds"]) {
          edges {
            cursor
            node {
              id
              teamId
              userId
              content
              ...NullableTask_task
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `,
    team: graphql`
      fragment TeamArchive_team on Team {
        teamMemberFilter {
          id
        }
        teamMembers(sortBy: "preferredName") {
          id
          picture
          preferredName
        }
      }
    `
  },
  {
    direction: 'forward',
    getConnectionFromProps(props) {
      return props.viewer && props.viewer.archivedTasks
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        first: totalCount
      }
    },
    getVariables(_props, {count, cursor}, fragmentVariables) {
      return {
        ...fragmentVariables,
        first: count,
        after: cursor
      }
    },
    query: graphql`
      query TeamArchivePaginationQuery(
        $first: Int!
        $after: DateTime
        $teamIds: [ID!]
        $userIds: [ID!]
      ) {
        viewer {
          ...TeamArchive_viewer
        }
      }
    `
  }
)
