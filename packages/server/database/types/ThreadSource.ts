import ReflectionGroup from './ReflectionGroup'
import AgendaItem from './AgendaItem'

export type ThreadSourceEnum = 'AGENDA_ITEM' | 'REFLECTION_GROUP' | 'STORY'

export type ThreadSource = ReflectionGroup | AgendaItem
