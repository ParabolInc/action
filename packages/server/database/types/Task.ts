import dndNoise from 'parabol-client/utils/dndNoise'
import extractTextFromDraftString from 'parabol-client/utils/draftjs/extractTextFromDraftString'
import getTagsFromEntityMap from 'parabol-client/utils/draftjs/getTagsFromEntityMap'
import generateUID from '../../generateUID'
import {ThreadSourceEnum} from './ThreadSource'
import TaskIntegrationGitHub from './TaskIntegrationGitHub'
import TaskIntegrationJira from './TaskIntegrationJira'

export type AreaEnum = 'meeting' | 'teamDash' | 'userDash'
export type TaskStatusEnum = 'active' | 'stuck' | 'done' | 'future'
export type TaskTagEnum = 'private' | 'archived'
export type TaskServiceEnum = 'PARABOL' | 'github' | 'jira'

export interface TaskInput {
  id?: string
  content: string
  createdAt?: Date | null
  createdBy: string
  doneMeetingId?: string
  dueDate?: Date | null
  meetingId?: string | null
  plaintextContent?: string
  sortOrder?: number | null
  status: TaskStatusEnum
  teamId: string
  threadId?: string | null
  threadParentId?: string | null
  threadSortOrder?: number | null
  threadSource?: ThreadSourceEnum | null
  updatedAt?: Date
  userId?: string | null
}

export default class Task {
  id: string
  content: string
  createdAt: Date
  createdBy: string
  doneMeetingId?: string
  dueDate?: Date | null
  integration?: TaskIntegrationJira | TaskIntegrationGitHub
  meetingId?: string
  plaintextContent: string
  sortOrder: number
  status: TaskStatusEnum
  tags: TaskTagEnum[]
  teamId: string
  threadId?: string
  threadParentId?: string
  threadSortOrder?: number | null
  threadSource?: ThreadSourceEnum
  updatedAt: Date
  userId: string | null

  constructor(input: TaskInput) {
    const {
      id,
      userId,
      meetingId,
      teamId,
      content,
      createdAt,
      createdBy,
      doneMeetingId,
      dueDate,
      plaintextContent,
      sortOrder,
      status,
      threadParentId,
      threadSortOrder,
      threadSource,
      threadId,
      updatedAt
    } = input
    const {entityMap} = JSON.parse(content)
    const tags = getTagsFromEntityMap<TaskTagEnum>(entityMap)
    this.id = id || generateUID()
    this.threadId = threadId || undefined
    this.threadSource = threadSource || undefined
    this.content = content
    this.createdAt = createdAt || new Date()
    this.createdBy = createdBy
    this.doneMeetingId = doneMeetingId
    this.dueDate = dueDate || undefined
    this.meetingId = meetingId || undefined
    this.plaintextContent = plaintextContent || extractTextFromDraftString(content)
    this.sortOrder = sortOrder || dndNoise()
    this.status = status
    this.tags = tags
    this.teamId = teamId
    this.threadSortOrder = threadSortOrder || undefined
    this.threadParentId = threadParentId || undefined
    this.updatedAt = updatedAt || new Date()
    this.userId = userId || null
  }
}
