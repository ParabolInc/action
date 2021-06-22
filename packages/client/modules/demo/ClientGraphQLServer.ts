import EventEmitter from 'eventemitter3'
import {parse} from 'flatted'
import ms from 'ms'
import {Variables} from 'relay-runtime'
import StrictEventEmitter from 'strict-event-emitter-types'
import stringSimilarity from 'string-similarity'
import {PALETTE} from '~/styles/paletteV3'
import {MeetingSettingsThreshold, RetroDemo, SubscriptionChannel} from '../../types/constEnums'
import GoogleAnalyzedEntity from '../../../server/database/types/GoogleAnalyzedEntity'
import DiscussPhase from '../../../server/database/types/DiscussPhase'
import DiscussStage from '../../../server/database/types/DiscussStage'
import ReflectPhase from '../../../server/database/types/ReflectPhase'
import NewMeetingPhase from '../../../server/database/types/GenericMeetingPhase'
import NewMeetingStage from '../../../server/database/types/GenericMeetingStage'
import ITask from '../../../server/database/types/Task'
import ReflectionGroup from '../../../server/database/types/ReflectionGroup'
import Reflection from '../../../server/database/types/Reflection'
import {ReactableEnum} from '~/__generated__/AddReactjiToReactableMutation.graphql'
import {DragReflectionDropTargetTypeEnum} from '~/__generated__/EndDraggingReflectionMutation.graphql'
import {DISCUSS, GROUP, REFLECT, TASK, TEAM, VOTE} from '../../utils/constants'
import dndNoise from '../../utils/dndNoise'
import extractTextFromDraftString from '../../utils/draftjs/extractTextFromDraftString'
import getTagsFromEntityMap from '../../utils/draftjs/getTagsFromEntityMap'
import makeEmptyStr from '../../utils/draftjs/makeEmptyStr'
import findStageById from '../../utils/meetings/findStageById'
import sleep from '../../utils/sleep'
import getGroupSmartTitle from '../../utils/smartGroup/getGroupSmartTitle'
import groupReflections from '../../utils/smartGroup/groupReflections'
import startStage_ from '../../utils/startStage_'
import unlockAllStagesForPhase from '../../utils/unlockAllStagesForPhase'
import unlockNextStages from '../../utils/unlockNextStages'
import normalizeRawDraftJS from '../../validation/normalizeRawDraftJS'
import entityLookup from './entityLookup'
import getDemoEntities from './getDemoEntities'
import handleCompletedDemoStage from './handleCompletedDemoStage'
import initBotScript from './initBotScript'
import initDB, {
  demoTeamId,
  demoViewerId,
  GitHubProjectKeyLookup,
  JiraProjectKeyLookup
} from './initDB'
import LocalAtmosphere from './LocalAtmosphere'

export type DemoReflection = Omit<Reflection, 'reactjis' | 'createdAt' | 'updatedAt'> & {
  __typename: string
  createdAt: string | Date
  dragContext: any
  editorIds: any
  entities: any
  groupColor: string
  isEditing: any
  isHumanTouched: boolean
  isViewerCreator: boolean
  meeting: any
  prompt: any
  reactjis: any[]
  reflectionId: string
  retroReflectionGroup: DemoReflectionGroup
  updatedAt: string | Date
}

export type DemoReflectionGroup = Omit<ReflectionGroup, 'team' | 'createdAt' | 'updatedAt'> & {
  __typename: string
  commentCount: number
  commentors: any
  createdAt: string | Date
  meeting: any
  prompt: any
  reflectionGroupId: string
  reflections: DemoReflection[]
  tasks: any
  thread: any
  titleIsUserDefined: boolean
  updatedAt: string | Date
  viewerVoteCount: number
  voteCount: number
  voterIds: any
}

export type IDiscussPhase = Omit<
  DiscussPhase,
  'readyToAdvance' | 'endAt' | 'startAt' | 'promptTemplateId'
> & {
  readyToAdvance: any
  startAt: string | Date
  endAt: string | Date
}

export type IReflectPhase = Omit<ReflectPhase, 'endAt' | 'startAt'> & {
  startAt: string | Date
  endAt: string | Date
  focusedPromptId: string | null
  reflectPrompts: any
}

export type IDiscussStage = Omit<DiscussStage, 'endAt' | 'startAt'> & {
  startAt: string | Date
  endAt: string | Date
}
export type INewMeetingStage = Omit<NewMeetingStage, 'endAt' | 'startAt'> & {
  startAt: string | Date
  endAt: string | Date
}
export type INewMeetingPhase = Omit<NewMeetingPhase, 'endAt' | 'startAt'> & {
  startAt: string | Date
  endAt: string | Date
}

export type DemoTask = Omit<ITask, 'agendaItem'>

interface Payload {
  __typename: string

  [key: string]: any
}

interface DemoEvents {
  task: Payload
  team: Payload
  meeting: Payload
  botsFinished: void
  startDemo: void
}

interface GQLDemoEmitter {
  new(): StrictEventEmitter<EventEmitter, DemoEvents>
}

const makeReflectionGroupThread = () => ({
  __typename: 'ThreadableConnection',
  edges: [],
  pageInfo: {
    __typename: 'PageInfo',
    startCursor: null,
    endCursor: null,
    hasNextPage: false,
    hasPreviousPage: false
  }
})

class ClientGraphQLServer extends (EventEmitter as GQLDemoEmitter) {
  atmosphere: LocalAtmosphere
  db: ReturnType<typeof initDB>
  getTempId = (prefix) => `${prefix}${this.db._tempID++}`
  pendingBotTimeout: number | undefined
  pendingBotAction?: (() => any[]) | undefined
  isNew = true
  constructor(atmosphere: LocalAtmosphere) {
    super()
    this.atmosphere = atmosphere
    const demoDB = window.localStorage.getItem('retroDemo') || ''
    let validDB
    try {
      validDB = parse(demoDB)
    } catch (e) {
      // noop
    }
    // const isStale = false
    const isStale = !validDB || new Date(validDB._updatedAt).getTime() < Date.now() - ms('5m')
    this.db = isStale ? initDB(initBotScript()) : validDB
    if (!isStale) {
      this.isNew = false
      this.startBot()
    }
  }

  getUnlockedStages(stageIds: string[]) {
    const unlockedStages = [] as INewMeetingStage[]
    this.db.newMeeting.phases!.forEach((phase) => {
      ; (phase.stages as any).forEach((stage) => {
        if (stageIds.includes(stage.id)) {
          unlockedStages.push(stage)
        }
      })
    })
    return unlockedStages
  }

  startBot = () => {
    const facilitatorStageId = this.db.newMeeting.facilitatorStageId as string
    const mutations = this.db._botScript[facilitatorStageId]
    const nextMutaton = mutations.shift()
    if (!nextMutaton) {
      this.emit('botsFinished')
      return
    }
    const {delay, op, variables, botId} = nextMutaton
    this.pendingBotAction = () => {
      this.ops[op](variables, botId)
      return mutations
    }
    const timeout = (window as any).Cypress ? 400 : delay

    this.pendingBotTimeout = window.setTimeout(() => {
      this.pendingBotTimeout = undefined
      if (this.pendingBotAction) {
        this.pendingBotAction()
        this.pendingBotAction = undefined
      }
      this.startBot()
    }, timeout)
  }

  isBotFinished = () => {
    return !this.pendingBotAction
  }

  finishBotActions = async () => {
    window.clearTimeout(this.pendingBotTimeout)
    this.pendingBotTimeout = undefined
    if (!this.pendingBotAction) return
    const mutationsToFlush = this.pendingBotAction()
    if (this.db.newMeeting.facilitatorStageId !== RetroDemo.GROUP_STAGE_ID) {
      mutationsToFlush.forEach((mutation) => {
        this.ops[mutation.op](mutation.variables, mutation.botId)
      })
      mutationsToFlush.length = 0
      this.pendingBotAction = undefined
    }
  }

  ops = {
    ExportToCSVQuery: () => {
      return {
        viewer: {
          ...this.db.users[0],
          newMeeting: {
            ...this.db.newMeeting,
            reflectionGroups: (this.db.newMeeting as any).reflectionGroups.filter(
              (group) => group.voterIds.length > 0
            )
          }
        }
      }
    },
    TaskFooterIntegrateMenuRootQuery: () => {
      return {
        viewer: {
          ...this.db.users[0],
          userOnTeam: {
            ...this.db.users[0]
          }
        }
      }
    },
    NewMeetingSummaryRootQuery: () => {
      return {
        viewer: {
          ...this.db.users[0],
          newMeeting: {
            ...this.db.newMeeting,
            reflectionGroups: (this.db.newMeeting as any).reflectionGroups.filter(
              (group) => group.voterIds.length > 0
            ),
            meetingMembers: this.db.newMeeting.meetingMembers!.map((member) => ({
              ...member,
              tasks: member.tasks.filter((task) => !task.tags.includes('private'))
            }))
          }
        }
      }
    },
    TaskFooterUserAssigneeMenuRootQuery: () => {
      return {
        viewer: {
          ...this.db.users[0],
          teamMember: this.db.teamMembers[0],
          team: this.db.team
        }
      }
    },
    DemoMeetingRootQuery: () => {
      return {
        viewer: {
          ...this.db.users[0],
          meeting: this.db.newMeeting
        }
      }
    },
    DiscussionThreadRootQuery: ({threadSourceId}) => {
      return {
        viewer: {
          ...this.db.users[0],
          meeting: {
            ...this.db.newMeeting,
            threadSource: this.db.reflectionGroups.find(
              (reflectionGroup) => reflectionGroup.id === threadSourceId
            )
          }
        }
      }
    },
    SuggestMentionableUsersRootQuery: () => {
      return {
        viewer: {
          ...this.db.users[0],
          team: {
            ...this.db.team,
            teamMembers: this.db.team.teamMembers.filter((member) => member.userId !== demoViewerId)
          }
        }
      }
    },
    useAllIntegrationsQuery: () => {
      return {
        viewer: {
          ...this.db.users[0],
          userOnTeam: {
            ...this.db.users[0]
          }
        }
      }
    },
    AddCommentMutation: ({comment}, userId) => {
      const commentId = comment.id || this.getTempId('comment')
      const {isAnonymous} = comment
      const newComment = {
        ...comment,
        __typename: 'Comment',
        content: normalizeRawDraftJS(comment.content),
        createdAt: new Date().toJSON(),
        updatedAt: new Date().toJSON(),
        createdBy: isAnonymous ? null : userId,
        createdByUser: isAnonymous ? null : this.db.users.find(({id}) => id === userId),
        id: commentId,
        isActive: true,
        isViewerComment: userId === demoViewerId,
        reactjis: [],
        replies: [],
        threadParentId: comment.threadParentId || null
      }
      this.db.comments.push(newComment)
      const {threadParentId, threadId} = newComment
      if (threadParentId) {
        const threadParent =
          this.db.tasks.find(({id}) => id === threadParentId) ||
          this.db.comments.find(({id}) => id === threadParentId)
        threadParent?.replies.push(newComment)
      } else {
        const reflectionGroup = this.db.reflectionGroups.find((group) => group.id === threadId)!
        reflectionGroup.thread.edges.push({
          __typename: 'ThreadableEdge',
          cursor: newComment.createdAt,
          node: newComment
        })
      }

      const data = {
        __typename: 'AddCommentSuccess',
        error: null,
        comment: newComment
      }
      if (userId !== demoViewerId) {
        this.emit(SubscriptionChannel.MEETING, data)
      }
      return {addComment: data}
    },
    AddReactjiToReactableMutation: ({reactableId, reactableType, isRemove, reactji}, userId) => {
      const table =
        (reactableType as ReactableEnum) === 'REFLECTION' ? this.db.reflections : this.db.comments
      const reactable = table.find(({id}) => id === reactableId)
      if (!reactable) return null
      const reactjiId = `${reactableId}:${reactji}`
      const {reactjis} = reactable
      const existingReactjiIdx = reactjis.findIndex((agg) => agg.id === reactjiId)
      const existingReactji = reactjis[existingReactjiIdx]
      if (isRemove) {
        if (!existingReactji) return null
        if (existingReactji.count === 1) {
          reactjis.splice(existingReactjiIdx, 1)
        } else {
          existingReactji.count--
          existingReactji.isViewerReactji = false
        }
      } else {
        if (!existingReactji) {
          reactjis.push({id: reactjiId, count: 1, isViewerReactji: userId === demoViewerId})
        } else {
          existingReactji.count++
          existingReactji.isViewerReactji =
            existingReactji.isViewerReactji || userId === demoViewerId
        }
      }
      const data = {
        __typename: 'AddReactjiToReactableSuccess',
        reactable
      }
      if (userId !== demoViewerId) {
        this.emit(SubscriptionChannel.MEETING, data)
      }
      return {addReactjiToReactable: data}
    },
    CreateGitHubTaskIntegrationMutation: ({taskId, nameWithOwner}, userId) => {
      const task = this.db.tasks.find((task) => task.id === taskId)
      // if the human deleted the task, exit fast
      if (!task) return null
      Object.assign(task, {
        updatedAt: new Date().toJSON(),
        integration: {
          __typename: 'TaskIntegrationGitHub',
          id: `${taskId}:GitHub`,
          ...GitHubProjectKeyLookup[nameWithOwner],
          issueNumber: this.getTempId('')
        }
      })

      const data = {
        __typename: 'CreateGitHubTaskIntegrationPayload',
        error: null,
        task
      }
      if (userId !== demoViewerId) {
        this.emit(TASK, data)
      }
      return {createGitHubTaskIntegration: data}
    },
    CreateJiraTaskIntegrationMutation: ({projectKey, taskId}, userId) => {
      const task = this.db.tasks.find((task) => task.id === taskId)
      // if the human deleted the task, exit fast
      if (!task) return null
      Object.assign(task, {
        updatedAt: new Date().toJSON(),
        integration: {
          __typename: 'TaskIntegrationJira',
          id: `${taskId}:jira`,
          ...JiraProjectKeyLookup[projectKey],
          issueKey: this.getTempId(`${projectKey}-`)
        }
      })

      const data = {
        __typename: 'CreateJiraTaskIntegrationPayload',
        error: null,
        task
      }
      if (userId !== demoViewerId) {
        this.emit(TASK, data)
      }
      return {createJiraTaskIntegration: data}
    },
    CreateReflectionMutation: async (
      {input: {content, promptId, sortOrder, id, groupId}},
      userId: string
    ) => {
      const now = new Date().toJSON()
      const reflectPhase = (this.db.newMeeting.phases![1] as unknown) as IReflectPhase
      const prompt = reflectPhase.reflectPrompts.find((prompt) => prompt.id === promptId)
      const reflectionGroupId = groupId || this.getTempId('refGroup')
      const reflectionId = id || this.getTempId('ref')
      const normalizedContent = normalizeRawDraftJS(content)
      const plaintextContent = extractTextFromDraftString(normalizedContent)
      let entities = [] as GoogleAnalyzedEntity[]
      if (userId !== demoViewerId) {
        entities = entityLookup[reflectionId].entities
      } else {
        entities = (await getDemoEntities(plaintextContent)) as any
      }

      const reflection = {
        __typename: 'RetroReflection',
        id: reflectionId,
        isHumanTouched: false,
        reflectionId,
        createdAt: now,
        creatorId: userId,
        content: normalizedContent,
        groupColor: PALETTE.JADE_400,
        plaintextContent,
        dragContext: null,
        editorIds: [],
        isActive: true,
        isEditing: null,
        isViewerCreator: userId === demoViewerId,
        entities,
        meetingId: RetroDemo.MEETING_ID,
        meeting: this.db.newMeeting,
        prompt,
        promptId,
        reactjis: [] as any[],
        reflectionGroupId,
        sortOrder: 0,
        updatedAt: now,
        retroReflectionGroup: undefined as any
      } as DemoReflection

      const smartTitle = getGroupSmartTitle([reflection])

      const reflectionGroup = {
        __typename: 'RetroReflectionGroup',
        commentCount: 0,
        commentors: null,
        id: reflectionGroupId,
        reflectionGroupId,
        smartTitle,
        title: smartTitle,
        voteCount: 0,
        viewerVoteCount: 0,
        createdAt: now,
        isActive: true,
        meetingId: RetroDemo.MEETING_ID,
        meeting: this.db.newMeeting,
        prompt,
        promptId,
        reflections: [reflection],
        sortOrder,
        tasks: [],
        thread: makeReflectionGroupThread(),
        titleIsUserDefined: false,
        updatedAt: now,
        voterIds: []
      } as DemoReflectionGroup

      reflection.retroReflectionGroup = reflectionGroup as any
      this.db.reflectionGroups.push(reflectionGroup)
      this.db.reflections.push(reflection)
      const unlockedStageIds = unlockAllStagesForPhase(
        this.db.newMeeting.phases as any,
        'group',
        true
      )
      const unlockedStages = this.getUnlockedStages(unlockedStageIds)
      const data = {
        meetingId: RetroDemo.MEETING_ID,
        reflection,
        reflectionId: reflection.id,
        reflectionGroupId,
        reflectionGroup,
        unlockedStageIds,
        unlockedStages,
        __typename: 'CreateReflectionPayload'
      }

      if (userId !== demoViewerId) {
        this.emit(SubscriptionChannel.MEETING, data)
      }
      return {createReflection: data}
    },
    EditCommentingMutation: (
      {
        isCommenting,
        meetingId,
        threadId
      }: {isCommenting: boolean; meetingId: string; threadId: string},
      userId
    ) => {
      const commentor = this.db.users.find((user) => user.id === userId)
      const data = {
        isCommenting,
        commentor,
        meetingId,
        threadId,
        __typename: 'EditCommentingPayload'
      }
      if (userId !== demoViewerId) {
        this.emit(SubscriptionChannel.MEETING, data)
      }
      return {editCommenting: data}
    },
    EditReflectionMutation: (
      {promptId, isEditing}: {promptId: string; isEditing: boolean},
      userId
    ) => {
      const data = {
        promptId,
        editorId: userId,
        isEditing,
        __typename: 'EditReflectionPayload'
      }
      if (userId !== demoViewerId) {
        this.emit(SubscriptionChannel.MEETING, data)
      }
      return {editReflection: data}
    },
    FlagReadyToAdvanceMutation: (
      {stageId, isReady}: {stageId: string; isReady: boolean},
      userId: string
    ) => {
      const meeting = this.db.newMeeting
      const {phases} = meeting
      const stageRes = findStageById(phases, stageId)
      const {stage} = stageRes!
      const increment = isReady ? 1 : -1
      stage.readyCount += increment

      const data = {
        __typename: 'FlagReadyToAdvanceSuccess',
        stage,
        meeting
      }

      if (userId !== demoViewerId) {
        this.emit(SubscriptionChannel.MEETING, data)
      }
      return {renameMeeting: data}
    },
    RemoveReflectionMutation: ({reflectionId}: {reflectionId: string}, userId: string) => {
      const reflection = this.db.reflections.find((reflection) => reflection.id === reflectionId)!
      reflection.isActive = false
      const group = this.db.reflectionGroups.find(
        (group) => group.id === reflection.reflectionGroupId
      )!
      if (group.reflections && group.reflections.length === 1) {
        group.isActive = false
      }
      const remainingReflections = this.db.reflections.filter((reflection) => reflection.isActive)
      const unlockedStageIds = remainingReflections.length
        ? unlockAllStagesForPhase(this.db.newMeeting.phases as any, 'group', true)
        : []

      const unlockedStages = this.getUnlockedStages(unlockedStageIds)
      const data = {
        meetingId: RetroDemo.MEETING_ID,
        meeting: this.db.newMeeting,
        reflectionId,
        reflection,
        unlockedStages,
        unlockedStageIds,
        __typename: 'RemoveReflectionMutation'
      }
      if (userId !== demoViewerId) {
        this.emit(SubscriptionChannel.MEETING, data)
      }
      return {removeReflection: data}
    },
    UpdateReflectionContentMutation: async ({reflectionId, content}, userId) => {
      const reflection = this.db.reflections.find((reflection) => reflection.id === reflectionId)!
      reflection.content = content
      reflection.updatedAt = new Date().toJSON()
      const plaintextContent = extractTextFromDraftString(content)
      const isVeryDifferent =
        stringSimilarity.compareTwoStrings(plaintextContent, reflection.plaintextContent) < 0.9
      const entities = isVeryDifferent
        ? await getDemoEntities(plaintextContent)
        : reflection.entities
      reflection.plaintextContent = plaintextContent
      reflection.entities = entities as any

      const reflectionsInGroup = this.db.reflections.filter(
        ({reflectionGroupId}) => reflectionGroupId === reflection.reflectionGroupId
      )
      const newTitle = getGroupSmartTitle(reflectionsInGroup)
      const reflectionGroup = this.db.reflectionGroups.find(
        (group) => group.id === reflection.reflectionGroupId
      )
      if (reflectionGroup) {
        const titleIsUserDefined = reflectionGroup.smartTitle !== reflectionGroup.title
        reflectionGroup.smartTitle = newTitle
        if (!titleIsUserDefined) {
          reflectionGroup.title = newTitle
        }
      }
      const data = {
        error: null,
        meeting: this.db.newMeeting,
        reflection,
        __typename: 'UpdateReflectionContentMutation'
      }
      if (userId !== demoViewerId) {
        this.emit(SubscriptionChannel.MEETING, data)
      }
      return {updateReflectionContent: data}
    },
    UpdateRetroMaxVotesMutation: async ({totalVotes, maxVotesPerGroup}) => {
      const {newMeeting: meeting, meetingMembers} = this.db
      if (
        totalVotes < MeetingSettingsThreshold.RETROSPECTIVE_TOTAL_VOTES_DEFAULT ||
        maxVotesPerGroup < MeetingSettingsThreshold.RETROSPECTIVE_MAX_VOTES_PER_GROUP_DEFAULT
      ) {
        return {
          updateRetroMaxVotes: {
            __typename: 'ErrorPayload',
            error: {message: 'Your team has already spent their votes'}
          }
        }
      }
      const totalDiff = totalVotes - (meeting as any).totalVotes
      meeting.totalVotes = totalVotes
      meeting.maxVotesPerGroup = maxVotesPerGroup
      meetingMembers.forEach((member) => {
        member.votesRemaining += totalDiff
      })
      meeting.votesRemaining = meetingMembers.reduce(
        (sum, member) => sum + member.votesRemaining,
        0
      )
      const data = {
        __typename: 'UpdateRetroMaxVotesSuccess',
        meeting
      }
      return {updateRetroMaxVotes: data}
    },
    NavigateMeetingMutation: async ({completedStageId, facilitatorStageId, meetingId}, userId) => {
      let phaseCompleteData
      let unlockedStageIds
      const meeting = this.db.newMeeting
      const {phases} = meeting
      let runBot = false
      if (completedStageId) {
        const completedStageRes = findStageById(phases, completedStageId)
        const {stage} = completedStageRes! as any
        if (!stage.isComplete) {
          runBot = true
          stage.isComplete = true
          stage.endAt = new Date().toJSON()
          phaseCompleteData = await handleCompletedDemoStage(this.db, stage)
          const groupData = phaseCompleteData[GROUP]
          if (groupData) {
            Object.assign(groupData, {
              meeting: this.db.newMeeting
            })
          } else if (phaseCompleteData[VOTE]) {
            Object.assign(phaseCompleteData[VOTE], {
              meeting: this.db.newMeeting
            })
          }
        }
      }
      if (!phaseCompleteData || Object.keys(phaseCompleteData).length === 0) {
        phaseCompleteData = {[REFLECT]: null, [GROUP]: null, [VOTE]: null}
      }
      if (facilitatorStageId) {
        const facilitatorStageRes = findStageById(phases, facilitatorStageId)
        const {stage: facilitatorStage} = facilitatorStageRes!
        startStage_(facilitatorStage)

        // mutative! sets isNavigable and isNavigableByFacilitator
        unlockedStageIds = unlockNextStages(facilitatorStageId, phases!)
      }

      const oldFacilitatorStageId = this.db.newMeeting.facilitatorStageId!
      Object.assign(this.db.newMeeting, {
        facilitatorStageId,
        updatedAt: new Date().toJSON()
      })

      const data = {
        error: null,
        meetingId,
        meeting: this.db.newMeeting,
        oldFacilitatorStageId,
        oldFacilitatorStage: findStageById(phases, oldFacilitatorStageId)!.stage,
        facilitatorStageId,
        facilitatorStage: findStageById(phases, facilitatorStageId)!.stage,
        unlockedStageIds,
        unlockedStages: unlockedStageIds.map((stageId) => findStageById(phases, stageId)!.stage),
        phaseComplete: phaseCompleteData,
        __typename: 'NavigateMeetingMutation'
      }
      if (userId !== demoViewerId) {
        this.emit(SubscriptionChannel.MEETING, data)
      }
      if (runBot) {
        this.startBot()
      }
      return {navigateMeeting: data}
    },
    RenameMeetingMutation: ({name}, userId) => {
      const meeting = this.db.newMeeting
      meeting.name = name
      const data = {
        __typename: 'RenameMeetingSuccess',
        meeting
      }
      if (userId !== demoViewerId) {
        this.emit(SubscriptionChannel.MEETING, data)
      }
      return {renameMeeting: data}
    },
    SetPhaseFocusMutation: ({focusedPromptId}, userId) => {
      const reflectPhase = (this.db.newMeeting.phases!.find(
        (phase) => phase.phaseType === REFLECT
      ) as unknown) as IReflectPhase
      reflectPhase.focusedPromptId = focusedPromptId || null
      const data = {
        meetingId: RetroDemo.MEETING_ID,
        meeting: this.db.newMeeting,
        reflectPhase,
        __typename: 'SetPhaseFocusMutation'
      }
      if (userId !== demoViewerId) {
        this.emit(SubscriptionChannel.MEETING, data)
      }
      return {setPhaseFocus: data}
    },
    SetSlackNotificationMutation: ({slackChannelId, slackNotificationEvents}, userId) => {
      const teamMember = this.db.teamMembers.find((teamMember) => teamMember.userId === userId)!
      const {integrations} = teamMember
      const {slack} = integrations
      const {notifications} = slack
      const filteredNotifications = notifications.filter((notification) =>
        slackNotificationEvents.includes(notification.event)
      )
      filteredNotifications.forEach((notification) => {
        notification.channelId = slackChannelId
      })
      const slackNotificationIds = filteredNotifications.map(({id}) => id)
      const data = {
        __typename: 'SetSlackNotificationMutation',
        error: null,
        userId,
        user: this.db.users.find((user) => user.id === userId),
        slackNotificationIds
      }
      if (userId !== demoViewerId) {
        this.emit(TEAM, data)
      }
      return {setSlackNotification: data}
    },
    SetStageTimerMutation: ({scheduledEndTime: newScheduledEndTime, timeRemaining}, userId) => {
      const {phases, facilitatorStageId} = this.db.newMeeting
      const stageRes = findStageById(phases, facilitatorStageId!)
      const {stage} = stageRes!

      if (newScheduledEndTime) {
        stage.scheduledEndTime = newScheduledEndTime
        stage.isAsync = !timeRemaining
        stage.timeRemaining = newScheduledEndTime - Date.now()
      } else {
        stage.isAsync = null
        stage.scheduledEndTime = null
        stage.timeRemaining = null
      }
      const data = {
        __typename: 'SetStageTimerMutation',
        error: null,
        meetingId: RetroDemo.MEETING_ID,
        meeting: this.db.newMeeting,
        stageId: facilitatorStageId,
        stage
      }
      if (userId !== demoViewerId) {
        this.emit(SubscriptionChannel.MEETING, data)
      }
      return {setStageTimer: data}
    },
    StartDraggingReflectionMutation: ({reflectionId, dragId}, userId) => {
      const reflection = this.db.reflections.find((reflection) => reflection.id === reflectionId)!
      if (!reflection) return
      if (userId !== demoViewerId) {
        if (reflection.isHumanTouched) return
      } else {
        reflection.isHumanTouched = true
      }
      const user = this.db.users.find((user) => user.id === userId)
      const data = {
        error: null,
        teamId: demoTeamId,
        meetingId: RetroDemo.MEETING_ID,
        reflectionId,
        reflection,
        remoteDrag: {
          id: dragId,
          dragUserId: userId,
          dragUserName: user ? user.preferredName : 'A Ghost'
        },
        __typename: 'StartDraggingReflectionPayload'
      }
      if (userId !== demoViewerId) {
        this.emit(SubscriptionChannel.MEETING, data)
      }
      return {startDraggingReflection: data}
    },
    EndDraggingReflectionMutation: (
      {reflectionId, dropTargetType, dropTargetId, dragId},
      userId
    ) => {
      const now = new Date().toJSON()
      let newReflectionGroupId
      const reflection = this.db.reflections.find((reflection) => reflection.id === reflectionId)!
      if (userId !== demoViewerId) {
        if (!reflection || reflection.isHumanTouched) return undefined
      }
      const {reflectionGroupId: oldReflectionGroupId} = reflection
      const oldReflectionGroup = this.db.reflectionGroups.find(
        (group) => group.id === oldReflectionGroupId
      )!
      const oldReflections = oldReflectionGroup.reflections!
      let failedDrop = false
      if ((dropTargetType as DragReflectionDropTargetTypeEnum) === 'REFLECTION_GRID') {
        const {promptId} = reflection
        newReflectionGroupId = this.getTempId('group')
        const newReflectionGroup = {
          __typename: 'RetroReflectionGroup',
          id: newReflectionGroupId,
          reflectionGroupId: newReflectionGroupId,
          title: null,
          voteCount: 0,
          viewerVoteCount: 0,
          createdAt: now,
          isActive: true,
          meetingId: RetroDemo.MEETING_ID,
          meeting: this.db.newMeeting,
          prompt: reflection.prompt,
          promptId,
          reflections: [reflection],
          sortOrder: 0,
          tasks: [],
          thread: makeReflectionGroupThread(),
          updatedAt: now,
          voterIds: []
        } as any

        this.db.reflectionGroups.push(newReflectionGroup)
        oldReflections.splice(oldReflections.indexOf(reflection as any), 1)

        Object.assign(reflection, {
          sortOrder: 0,
          reflectionGroupId: newReflectionGroupId,
          updatedAt: now
        })
        this.db.newMeeting.nextAutoGroupThreshold = null
        const nextTitle = getGroupSmartTitle([reflection as DemoReflection])
        newReflectionGroup.smartTitle = nextTitle
        newReflectionGroup.title = nextTitle
        if (oldReflections.length > 0) {
          const oldTitle = getGroupSmartTitle(oldReflections)
          const titleIsUserDefined = oldReflectionGroup.smartTitle !== oldReflectionGroup.title
          oldReflectionGroup.smartTitle = oldTitle
          if (!titleIsUserDefined) {
            oldReflectionGroup.title = oldTitle
          }
        } else {
          const meetingGroups = (this.db.newMeeting as any).reflectionGroups
          meetingGroups.splice(meetingGroups.indexOf(oldReflectionGroup as any), 1)
          Object.assign(oldReflectionGroup, {
            isActive: false,
            updatedAt: now
          })
        }
      } else if (
        (dropTargetType as DragReflectionDropTargetTypeEnum) === 'REFLECTION_GROUP' &&
        dropTargetId
      ) {
        // group
        const reflectionGroup = this.db.reflectionGroups.find((group) => group.id === dropTargetId)!
        if (reflectionGroup) {
          newReflectionGroupId = dropTargetId
          const sortOrders = this.db.reflections
            .filter((r) => r.reflectionGroupId === newReflectionGroupId)
            .map((r) => (r && r.sortOrder) || 0)
          const maxSortOrder = Math.max(...sortOrders)
          Object.assign(reflection, {
            sortOrder: maxSortOrder + 1 + dndNoise(),
            reflectionGroupId: newReflectionGroupId,
            retroReflectionGroup: reflectionGroup as any,
            updatedAt: now
          })
          reflectionGroup.reflections!.push(reflection as any)
          reflectionGroup.reflections.sort((a, b) => (a.sortOrder < b.sortOrder ? 1 : -1))
          oldReflections.splice(
            oldReflections.findIndex((reflection) => reflection === reflection),
            1
          )
          if (oldReflectionGroupId !== newReflectionGroupId) {
            const reflections = this.db.reflections
            const nextReflections = reflections.filter(
              (reflection) => reflection.reflectionGroupId === newReflectionGroupId
            )
            const oldReflections = reflections.filter(
              (reflection) => reflection.reflectionGroupId === oldReflectionGroupId
            )
            const nextTitle = getGroupSmartTitle(nextReflections)
            const titleIsUserDefined = reflectionGroup.smartTitle !== reflectionGroup.title
            reflectionGroup.smartTitle = nextTitle
            if (!titleIsUserDefined) {
              reflectionGroup.title = nextTitle
            }
            const oldReflectionGroup = this.db.reflectionGroups.find(
              (group) => group.id === oldReflectionGroupId
            )!
            if (oldReflections.length > 0) {
              const oldTitle = getGroupSmartTitle(oldReflections)
              const titleIsUserDefined = oldReflectionGroup.smartTitle !== oldReflectionGroup.title
              oldReflectionGroup.smartTitle = oldTitle
              if (!titleIsUserDefined) {
                oldReflectionGroup.title = oldTitle
              }
            } else {
              const meetingGroups = (this.db.newMeeting as any).reflectionGroups
              meetingGroups.splice(meetingGroups.indexOf(oldReflectionGroup as any), 1)
              oldReflectionGroup.isActive = false
              oldReflectionGroup.updatedAt = now
            }
          }
        } else {
          failedDrop = true
        }
      }
      const user = this.db.users.find((user) => user.id === userId)
      const data = {
        __typename: 'EndDraggingReflectionPayload',
        meetingId: RetroDemo.MEETING_ID,
        meeting: this.db.newMeeting,
        reflectionId,
        reflection,
        reflectionGroupId: newReflectionGroupId,
        reflectionGroup: this.db.reflectionGroups.find(
          (group) => group.id === newReflectionGroupId
        ),
        oldReflectionGroupId,
        oldReflectionGroup,
        userId,
        dropTargetType: failedDrop ? null : dropTargetType,
        dropTargetId: failedDrop ? null : dropTargetId,
        remoteDrag: {
          id: dragId,
          dragUserId: userId,
          dragUserName: user ? user.preferredName : 'A Ghost'
        }
      }

      if (userId !== demoViewerId) {
        this.emit(SubscriptionChannel.MEETING, data)
      }
      return {endDraggingReflection: data}
    },
    UpdateDragLocationMutation: ({input}, userId) => {
      const {teamId, ...inputData} = input
      const data = {
        drag: inputData,
        remoteDrag: inputData,
        userId,
        __typename: 'UpdateDragLocationPayload'
      }
      if (userId !== demoViewerId) {
        const {sourceId} = inputData
        const reflection = this.db.reflections.find((reflection) => reflection.id === sourceId)
        if (!reflection || reflection.isHumanTouched) return undefined
        this.emit(SubscriptionChannel.MEETING, data)
      }
      return {updateDragLocation: data}
    },
    AutoGroupReflectionsMutation: ({meetingId, groupingThreshold}, userId) => {
      const now = new Date().toJSON()
      const reflections = this.db.reflections.filter((reflection) => reflection.isActive)
      const {
        autoGroupThreshold,
        groupedReflections,
        groups,
        removedReflectionGroupIds,
        nextThresh
      } = groupReflections(reflections as any, groupingThreshold)
      removedReflectionGroupIds.forEach((groupId) => {
        const group = this.db.reflectionGroups.find((group) => group.id === groupId)!
        group.isActive = false
        const meetingGroups = (this.db.newMeeting as any).reflectionGroups
        meetingGroups.splice(meetingGroups.indexOf(group as any), 1)
        group.reflections!.length = 0
      })

      groups.forEach((updatedGroup) => {
        const group = this.db.reflectionGroups.find((group) => group.id === updatedGroup.id)
        Object.assign(group, {
          title: updatedGroup.title,
          smartTitle: updatedGroup.smartTitle,
          updatedAt: now
        })
      })
      groupedReflections.forEach((updatedReflection) => {
        const reflection = this.db.reflections.find((r) => r.id === updatedReflection.id)
        const newGroup = this.db.reflectionGroups.find(
          (group) => group.id === updatedReflection.reflectionGroupId
        )!
        if (!newGroup.reflections!.includes(reflection as any)) {
          newGroup.reflections!.push(reflection as any)
        }
        Object.assign(reflection, {
          autoReflectionGroupId: updatedReflection.reflectionGroupId,
          reflectionGroupId: updatedReflection.reflectionGroupId,
          sortOrder: updatedReflection.sortOrder,
          updatedAt: now
        })
      })
      Object.assign(this.db.newMeeting, {
        autoGroupThreshold,
        nextAutoGroupThreshold: nextThresh
      })

      const reflectionGroupIds = groups.map(({id}) => id)
      const reflectionIds = groupedReflections.map(({id}) => id)
      const data = {
        error: null,
        meeting: this.db.newMeeting,
        meetingId,
        reflections: groupedReflections,
        reflectionGroups: groups,
        removedReflectionGroups: this.db.reflectionGroups.filter((group) =>
          removedReflectionGroupIds.includes(group.id as string)
        ),
        reflectionGroupIds,
        reflectionIds,
        removedReflectionGroupIds,
        __typename: 'AutoGroupReflectionsMutation'
      }
      if (userId !== demoViewerId) {
        this.emit(SubscriptionChannel.MEETING, data)
      }
      return {autoGroupReflections: data}
    },
    UpdateReflectionGroupTitleMutation: ({reflectionGroupId, title}, userId) => {
      const reflectionGroup = this.db.reflectionGroups.find(
        (group) => group.id === reflectionGroupId
      )!
      const now = new Date().toJSON()
      Object.assign(reflectionGroup, {
        title,
        titleIsUserDefined: true,
        updatedAt: now
      })
      const data = {
        __typename: 'UpdateReflectionGroupTitleMutation',
        error: null,
        meeting: this.db.newMeeting,
        meetingId: RetroDemo.MEETING_ID,
        reflectionGroupId,
        reflectionGroup
      }
      if (userId !== demoViewerId) {
        this.emit(SubscriptionChannel.MEETING, data)
      }
      return {updateReflectionGroupTitle: data}
    },
    VoteForReflectionGroupMutation: ({isUnvote, reflectionGroupId}, userId) => {
      const reflectionGroup =
        this.db.reflectionGroups.find((group) => group.id === reflectionGroupId) ||
        this.db.reflectionGroups.find((group) => Boolean(group.isActive))!
      if (!reflectionGroup) return null
      const meetingMember = this.db.meetingMembers.find((member) => member.userId === userId)!
      const {voterIds} = reflectionGroup
      const now = new Date().toJSON()
      if (isUnvote) {
        const idx = voterIds.indexOf(userId)
        if (idx === -1) {
          return {error: {message: 'no votes'}}
        }
        voterIds.splice(idx, 1)
        Object.assign(meetingMember, {
          votesRemaining: meetingMember.votesRemaining + 1,
          updatedAt: now
        })
        Object.assign(this.db.newMeeting, {
          votesRemaining: this.db.newMeeting.votesRemaining! + 1
        })
      } else {
        voterIds.push(userId)
        Object.assign(meetingMember, {
          votesRemaining: meetingMember.votesRemaining - 1,
          updatedAt: now
        })
        Object.assign(this.db.newMeeting, {
          votesRemaining: this.db.newMeeting.votesRemaining! - 1
        })
      }
      reflectionGroup.voteCount = voterIds.length
      reflectionGroup.viewerVoteCount = voterIds.filter((id) => id === demoViewerId).length
      const voteCount = this.db.reflectionGroups.reduce(
        (sum, group) => sum + group.voterIds!.length,
        0
      )

      let isUnlock
      let unlockedStageIds
      if (voteCount === 0) {
        isUnlock = false
      } else if (voteCount === 1 && !isUnvote) {
        isUnlock = true
      }
      const phases = this.db.newMeeting.phases as any
      if (isUnlock !== undefined) {
        unlockedStageIds = unlockAllStagesForPhase(phases, 'discuss', true, isUnlock)
      }

      const data = {
        __typename: 'VoteForReflectionGroupPayload',
        error: null,
        meeting: this.db.newMeeting,
        meetingId: RetroDemo.MEETING_ID,
        meetingMember,
        userId,
        reflectionGroupId: reflectionGroup.id,
        reflectionGroup,
        unlockedStageIds,
        unlockedStages: unlockedStageIds
          ? unlockedStageIds.map((stageId) => findStageById(phases, stageId)!.stage)
          : []
      }
      if (userId !== demoViewerId) {
        this.emit(SubscriptionChannel.MEETING, data)
      }
      return {voteForReflectionGroup: data}
    },
    CreateTaskMutation: async ({newTask}, userId) => {
      const now = new Date().toJSON()
      const taskId = newTask.id || this.getTempId('task')
      const {threadId, threadSource, threadParentId, threadSortOrder, sortOrder, status} = newTask
      const content = newTask.content || makeEmptyStr()
      const {entityMap} = JSON.parse(content)
      const tags = getTagsFromEntityMap(entityMap)
      const user = this.db.users.find((user) => user.id === userId)
      const task = {
        __typename: 'Task',
        agendaItem: null,
        id: taskId,
        taskId,
        content,
        createdAt: now,
        createdBy: userId,
        createdByUser: user,
        doneMeetingId: null,
        dueDate: null,
        editors: [],
        integration: null,
        team: this.db.team,
        meetingId: RetroDemo.MEETING_ID,
        replies: [],
        threadId,
        threadSource,
        threadParentId: threadParentId || null,
        threadSortOrder,
        sortOrder: sortOrder || 0,
        status,
        taskStatus: status,
        tags,
        teamId: demoTeamId,
        updatedAt: now,
        userId,
        user
      }
      this.db.tasks.push(task as any)
      const reflectionGroup = this.db.reflectionGroups.find((group) => group.id === threadId)!
      if (threadParentId) {
        const threadParent =
          this.db.comments.find(({id}) => id === threadParentId) ||
          this.db.tasks.find(({id}) => id === threadParentId)
        threadParent.replies.push(task)
      } else {
        reflectionGroup.thread.edges.push({
          __typename: 'ThreadableEdge',
          cursor: task.createdAt,
          node: task as any
        })
      }

      const meetingMember = this.db.meetingMembers.find((member) => member.userId === userId)!
      meetingMember.tasks.push(task as any)
      reflectionGroup.tasks!.push(task as any)
      const data = {
        __typename: 'CreateTaskPayload',
        error: null,
        task,
        involvementNotification: null
      }
      if (userId !== demoViewerId) {
        this.emit(TASK, data)
      }
      // a strange error occurs without sleep.
      // To reproduce, get to the discuss phase & quickly add a task before the bots do
      // the result is tasks == [undefined]
      // if a sleep is added, RetroDiscussPhase component is notified, but without, only MeetingAgendaCards is notified
      // (I removed MeetingAgendaCards, mentioned in the comment line above, as it’s unused, TA)
      // honestly, no good idea what is going on here. don't even know if it's relay or react (or me)
      await sleep(100)
      return {createTask: data}
    },
    DeleteCommentMutation: ({commentId}, userId) => {
      const comment = this.db.comments.find(({id}) => id === commentId)
      if (!comment) return
      comment.updatedAt = new Date().toJSON()
      comment.isActive = false

      const {threadParentId} = comment
      if (comment.threadParentId) {
        const threadParent =
          this.db.tasks.find(({id}) => id === threadParentId) ||
          this.db.comments.find(({id}) => id === threadParentId)
        if (threadParent) {
          const {__typename, isActive, replies} = threadParent
          const idx = replies.findIndex((reply) => reply.id === commentId)
          replies.splice(idx, 1)
          if (__typename === 'Comment' && !isActive) {
            this.ops.DeleteCommentMutation({commentId: threadParentId}, userId)
          }
        }
      } else if (comment.replies.length === 0) {
        const reflectionGroup = this.db.reflectionGroups.find(({id}) => id === threadParentId)
        if (reflectionGroup) {
          const {thread} = reflectionGroup
          const {edges} = thread
          const idx = edges.findIndex((edge) => edge.node.id === commentId)
          edges.splice(idx, 1)
        }
      }
      const data = {
        __typename: 'DeleteCommentSuccess',
        error: null,
        comment
      }
      if (userId !== demoViewerId) {
        this.emit(SubscriptionChannel.MEETING, data)
      }
      return {deleteComment: data}
    },
    EditTaskMutation: ({taskId, isEditing}, userId) => {
      const task = this.db.tasks.find((task) => task.id === taskId)!
      const data = {
        __typename: 'EditTaskMutation',
        error: null,
        task,
        editor: this.db.users.find((user) => user.id === userId),
        isEditing
      }
      if (userId !== demoViewerId) {
        this.emit(TASK, data)
      }
      return {editTask: data}
    },
    UpdateTaskMutation: ({updatedTask}, userId) => {
      const {content, status, sortOrder} = updatedTask
      const task = this.db.tasks.find((task) => task.id === updatedTask.id)
      // if the human deleted the task, exit fast
      if (!task) return null

      const taskUpdates = {
        content,
        status,
        tags: content ? getTagsFromEntityMap(JSON.parse(content).entityMap) : undefined,
        teamId: demoTeamId,
        sortOrder,
        userId: updatedTask.userId || task.userId
      }

      if (updatedTask.userId) {
        const oldMeetingMember = this.db.meetingMembers.find(
          (member) => member.userId === task.userId
        )!
        oldMeetingMember.tasks.splice(oldMeetingMember.tasks.indexOf(task as any), 1)
        const newMeetingMember = this.db.meetingMembers.find(
          (member) => member.userId === taskUpdates.userId
        )
        if (newMeetingMember) {
          newMeetingMember.tasks.push(task as any)
        }
      }
      Object.assign(task, {
        content: taskUpdates.content || task.content,
        status: taskUpdates.status || task.status,
        tags: taskUpdates.tags || task.tags,
        teamId: taskUpdates.teamId || task.teamId,
        sortOrder: taskUpdates.sortOrder || task.sortOrder,
        userId: taskUpdates.userId || task.userId
      })

      const data = {
        __typename: 'UpdateTaskPayload',
        error: null,
        task,
        privatizedTaskId: null,
        addedNotification: null
      }
      if (userId !== demoViewerId) {
        this.emit(TASK, data)
      }
      return {updateTask: data}
    },
    DeleteTaskMutation: ({taskId}, userId) => {
      const task = this.db.tasks.find((task) => task.id === taskId)!
      const {threadId} = task
      const reflectionGroup = this.db.reflectionGroups.find((group) => group.id === threadId)
      if (!reflectionGroup) return
      reflectionGroup.tasks!.splice(reflectionGroup.tasks!.indexOf(task as any), 1)
      const data = {
        __typename: 'DeleteTaskPayload',
        error: null,
        task,
        involvementNotification: null
      }
      if (userId !== demoViewerId) {
        this.emit(TASK, data)
      }
      return {deleteTask: data}
    },
    UpdateTaskDueDateMutation: ({taskId, dueDate}, userId) => {
      const task = this.db.tasks.find((task) => task.id === taskId)!
      task.dueDate = dueDate

      const data = {__typename: 'UpdateTaskDueDatePayload', error: null, task}
      if (userId !== demoViewerId) {
        this.emit(TASK, data)
      }
      return {updateTaskDueDate: data}
    },
    DragDiscussionTopicMutation: ({stageId, sortOrder}, userId) => {
      const discussPhase = (this.db.newMeeting.phases!.find(
        (phase) => phase.phaseType === DISCUSS
      ) as unknown) as IDiscussPhase
      const {stages} = discussPhase
      const draggedStage = stages.find((stage) => stage.id === stageId)!
      draggedStage.sortOrder = sortOrder
      stages.sort((a, b) => {
        return a.sortOrder > b.sortOrder ? 1 : -1
      })
      const data = {
        __typename: 'DragDiscussionTopicPayload',
        meeting: this.db.newMeeting,
        error: null,
        stage: draggedStage
      }
      if (userId !== demoViewerId) {
        this.emit(SubscriptionChannel.MEETING, data)
      }
      return {dragDiscussionTopic: data}
    },
    EndRetrospectiveMutation: ({meetingId}, userId) => {
      const phases = (this.db.newMeeting.phases as unknown) as INewMeetingPhase[]
      const lastPhase = phases[phases.length - 1] as IDiscussPhase
      const currentStage = lastPhase.stages.find(
        (stage) => stage.startAt && !stage.endAt
      ) as IDiscussStage
      const now = new Date().toJSON()
      if (currentStage) {
        currentStage.isComplete = true
        currentStage.endAt = now
      }

      this.db.newMeeting.endedAt = now

      const data = {
        error: null,
        meeting: this.db.newMeeting,
        meetingId,
        team: this.db.team,
        teamId: demoTeamId,
        isKill: !currentStage,
        removedTaskIds: [],
        removedSuggestedActionId: null,
        timelineEvent: null,
        updatedTasks: this.db.tasks,
        __typename: 'EndRetrospectiveSuccess'
      }
      if (userId !== demoViewerId) {
        this.emit(TEAM, data)
      }
      return {endRetrospective: data}
    },
    InviteToTeamMutation: ({invitees}) => {
      return {inviteToTeam: {invitees}}
    },
    UpdateCommentContentMutation: ({commentId, content}, userId) => {
      const comment = this.db.comments.find((comment) => comment.id === commentId)!
      comment.content = content

      const data = {__typename: 'UpdateCommentContentSuccess', error: null, comment}
      if (userId !== demoViewerId) {
        this.emit(SubscriptionChannel.MEETING, data)
      }
      return {updateCommentContent: data}
    }
  }

  fetch = async (opName: string, variables: Variables) => {
    const resolve = this.ops[opName]
    if (!resolve) {
      console.error('op not found', opName)
      return {
        errors: [{message: `op not found ${opName}`}]
      }
    }
    return {
      data: await resolve(variables, demoViewerId)
    }
  }
}

export default ClientGraphQLServer
