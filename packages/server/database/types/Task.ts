import shortid from 'shortid'
import dndNoise from 'parabol-client/utils/dndNoise'
import getTagsFromEntityMap from 'parabol-client/utils/draftjs/getTagsFromEntityMap'
import TaskIntegrationJira from './TaskIntegrationJira'
import TaskIntegrationGitHub from './TaskIntegrationGitHub'
import {ThreadSourceEnum} from 'parabol-client/types/graphql'
import extractTextFromDraftString from 'parabol-client/utils/draftjs/extractTextFromDraftString'

export type TaskStatus = 'active' | 'stuck' | 'done' | 'future'
export type TaskTag = 'private' | 'archived'

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
  status: TaskStatus
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
  status: TaskStatus
  tags: TaskTag[]
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
    const tags = getTagsFromEntityMap<TaskTag>(entityMap)
    this.id = id || shortid.generate()
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
