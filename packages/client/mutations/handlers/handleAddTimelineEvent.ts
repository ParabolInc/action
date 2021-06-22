import {ConnectionHandler, RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'

const handleAddTimelineEvent = (
  meeting: RecordProxy,
  timelineEvent: RecordProxy,
  store: RecordSourceSelectorProxy
) => {
  const viewer = store.getRoot().getLinkedRecord('viewer')
  if (!viewer || !meeting || !timelineEvent) return
  timelineEvent.setLinkedRecord(meeting, 'meeting')
  const timelineConnection = ConnectionHandler.getConnection(viewer, 'TimelineFeedList_timeline')
  if (timelineConnection) {
    const newEdge = ConnectionHandler.createEdge(
      store,
      timelineConnection,
      timelineEvent,
      'TimelineEventEdge'
    )
    newEdge.setValue(meeting.getValue('endedAt'), 'cursor')
    ConnectionHandler.insertEdgeBefore(timelineConnection, newEdge)
  }
}

export default handleAddTimelineEvent
