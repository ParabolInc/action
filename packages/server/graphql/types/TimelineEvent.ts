import {GraphQLBoolean, GraphQLID, GraphQLInt, GraphQLInterfaceType, GraphQLNonNull} from 'graphql'
import connectionDefinitions from '../connectionDefinitions'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import Organization from './Organization'
import PageInfoDateCursor from './PageInfoDateCursor'
import Team from './Team'
import TimelineEventTypeEnum from './TimelineEventTypeEnum'
import User from './User'

export const timelineEventInterfaceFields = () => ({
  id: {
    type: new GraphQLNonNull(GraphQLID),
    description: 'shortid'
  },
  createdAt: {
    type: new GraphQLNonNull(GraphQLISO8601Type),
    description: '* The timestamp the event was created at'
  },
  interactionCount: {
    type: new GraphQLNonNull(GraphQLInt),
    description: 'the number of times the user has interacted with (ie clicked) this event'
  },
  isActive: {
    type: new GraphQLNonNull(GraphQLBoolean),
    description: 'true if the timeline event is active, false if archived'
  },
  orgId: {
    type: GraphQLID,
    description: 'The orgId this event is associated with. Null if not traceable to one org'
  },
  organization: {
    type: Organization,
    description: 'The organization this event is associated with',
    resolve: ({orgId}, _args, {dataLoader}) => {
      return dataLoader.get('organizations').load(orgId)
    }
  },
  seenCount: {
    type: new GraphQLNonNull(GraphQLInt),
    description: 'the number of times the user has seen this event'
  },
  teamId: {
    type: GraphQLID,
    description: 'The teamId this event is associated with. Null if not traceable to one team'
  },
  team: {
    type: Team,
    description: 'The team that can see this event',
    resolve: ({teamId}, _args, {dataLoader}) => {
      return dataLoader.get('teams').load(teamId)
    }
  },
  type: {
    type: new GraphQLNonNull(TimelineEventTypeEnum),
    description: 'The specific type of event'
  },
  userId: {
    type: new GraphQLNonNull(GraphQLID),
    description: '* The userId that can see this event'
  },
  user: {
    type: new GraphQLNonNull(User),
    description: 'The user than can see this event',
    resolve: ({userId}, _args, {dataLoader}) => {
      return dataLoader.get('users').load(userId)
    }
  }
})

const TimelineEvent = new GraphQLInterfaceType({
  name: 'TimelineEvent',
  description: 'A past event that is important to the viewer',
  fields: timelineEventInterfaceFields
})

const {connectionType, edgeType} = connectionDefinitions({
  name: TimelineEvent.name,
  nodeType: TimelineEvent,
  edgeFields: () => ({
    cursor: {
      type: GraphQLISO8601Type
    }
  }),
  connectionFields: () => ({
    pageInfo: {
      type: PageInfoDateCursor,
      description: 'Page info with cursors coerced to ISO8601 dates'
    }
  })
})

export const TimelineEventConnection = connectionType
export const TimelineEventEdge = edgeType
export default TimelineEvent
