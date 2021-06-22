import generateUID from '../../generateUID'
import {MeetingTypeEnum} from './Meeting'

export type SharingScopeEnum = 'ORGANIZATION' | 'PUBLIC' | 'TEAM'

interface Input {
  name: string
  teamId: string
  scope?: SharingScopeEnum
  orgId: string
  parentTemplateId?: string
  lastUsedAt?: Date
  type: MeetingTypeEnum
  isStarter?: boolean
}

export default class MeetingTemplate {
  id: string
  createdAt: Date
  isActive: boolean
  updatedAt: Date
  name: string
  teamId: string
  lastUsedAt: Date | undefined
  scope: SharingScopeEnum
  orgId: string
  parentTemplateId?: string
  type: MeetingTypeEnum
  isStarter?: boolean

  constructor(input: Input) {
    const {name, teamId, scope, orgId, parentTemplateId, lastUsedAt, type, isStarter} = input
    const now = new Date()
    this.id = generateUID()
    this.createdAt = now
    this.isActive = true
    this.name = name
    this.teamId = teamId
    this.updatedAt = now
    this.scope = scope || 'TEAM'
    this.orgId = orgId
    this.parentTemplateId = parentTemplateId
    this.lastUsedAt = lastUsedAt ?? undefined
    this.type = type
    this.isStarter = isStarter
  }
}
