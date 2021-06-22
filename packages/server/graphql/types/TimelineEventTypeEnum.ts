import {GraphQLEnumType} from 'graphql'

export const COMPLETED_RETRO_MEETING = 'retroComplete'
export const COMPLETED_ACTION_MEETING = 'actionComplete'
export const JOINED_PARABOL = 'joinedParabol'
export const CREATED_TEAM = 'createdTeam'

const TimelineEventTypeEnum = new GraphQLEnumType({
  name: 'TimelineEventEnum',
  description: 'The specific type of event',
  values: {
    [COMPLETED_RETRO_MEETING]: {},
    [COMPLETED_ACTION_MEETING]: {},
    [JOINED_PARABOL]: {},
    [CREATED_TEAM]: {},
    POKER_COMPLETE: {}
  }
})

export default TimelineEventTypeEnum
