import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import {SprintPokerDefaults} from '~/types/constEnums'
import JiraServiceTaskId from '../../../client/shared/gqlIds/JiraServiceTaskId'
import EstimateStageDB from '../../database/types/EstimateStage'
import {NewMeetingPhaseTypeEnum} from '../../database/types/GenericMeetingPhase'
import MeetingPoker from '../../database/types/MeetingPoker'
import db from '../../db'
import getTemplateRefById from '../../postgres/queries/getTemplateRefById'
import getRedis from '../../utils/getRedis'
import {GQLContext} from '../graphql'
import EstimateUserScore from './EstimateUserScore'
import NewMeetingStage, {newMeetingStageFields} from './NewMeetingStage'
import ServiceField from './ServiceField'
import Story from './Story'
import TaskServiceEnum from './TaskServiceEnum'
import TemplateDimensionRef from './TemplateDimensionRef'
import User from './User'

interface Source extends EstimateStageDB {
  teamId: string
  meetingId: string
  phaseType: 'ESTIMATE'
}

const EstimateStage = new GraphQLObjectType<Source, GQLContext>({
  name: 'EstimateStage',
  description: 'The stage where the team estimates & discusses a single task',
  interfaces: () => [NewMeetingStage],
  isTypeOf: ({phaseType}) => (phaseType as NewMeetingPhaseTypeEnum) === 'ESTIMATE',
  fields: () => ({
    ...newMeetingStageFields(),
    creatorUserId: {
      type: GraphQLNonNull(GraphQLID),
      description:
        'The id of the user that added this stage. Useful for knowing which access key to use to get the underlying issue'
    },
    service: {
      type: GraphQLNonNull(TaskServiceEnum),
      description: 'The service the task is connected to',
      resolve: ({service}) => service || 'PARABOL'
    },
    serviceTaskId: {
      type: GraphQLNonNull(GraphQLID),
      description:
        'The key used to fetch the task used by the service. Jira: cloudId:issueKey. Parabol: taskId. github: nameWithOwner'
    },
    serviceField: {
      type: GraphQLNonNull(ServiceField),
      description: 'The field name used by the service for this dimension',
      resolve: async (
        {dimensionRefIdx, meetingId, service, serviceTaskId, teamId},
        _args,
        {dataLoader}
      ) => {
        if (service === 'jira') {
          const [meeting, team] = await Promise.all([
            dataLoader.get('newMeetings').load(meetingId),
            dataLoader.get('teams').load(teamId)
          ])
          const {templateRefId} = meeting
          const templateRef = await getTemplateRefById(templateRefId)
          const {dimensions} = templateRef
          const dimensionRef = dimensions[dimensionRefIdx]
          const {name: dimensionName} = dimensionRef
          const {cloudId, projectKey} = JiraServiceTaskId.split(serviceTaskId)
          const jiraDimensionFields = team.jiraDimensionFields || []
          const existingDimensionField = jiraDimensionFields.find(
            (field) =>
              field.dimensionName === dimensionName &&
              field.cloudId === cloudId &&
              field.projectKey === projectKey
          )

          if (existingDimensionField)
            return {name: existingDimensionField.fieldName, type: existingDimensionField.fieldType}

          return {name: SprintPokerDefaults.JIRA_FIELD_COMMENT, type: 'string'}
        }
        return {name: '', type: 'string'}
      }
    },
    sortOrder: {
      type: new GraphQLNonNull(GraphQLFloat),
      description: 'The sort order for reprioritizing discussion topics'
    },
    dimensionRefIdx: {
      type: GraphQLNonNull(GraphQLInt),
      description: 'The immutable index of the dimensionRef tied to this stage'
    },
    dimensionRef: {
      type: GraphQLNonNull(TemplateDimensionRef),
      description: 'The immutable dimension linked to this stage',
      resolve: async ({meetingId, dimensionRefIdx}, _args, {dataLoader}) => {
        const meeting = await dataLoader.get('newMeetings').load(meetingId)
        const {templateRefId} = meeting as MeetingPoker
        const templateRef = await getTemplateRefById(templateRefId)
        const {dimensions} = templateRef
        const {name, scaleRefId} = dimensions[dimensionRefIdx]
        return {
          name,
          scaleRefId,
          dimensionRefIdx,
          meetingId
        }
      }
    },
    finalScore: {
      type: GraphQLString,
      description: 'the final score, as defined by the facilitator'
    },
    hoveringUserIds: {
      type: GraphQLNonNull(GraphQLList(GraphQLNonNull(GraphQLID))),
      description: 'the userIds of the team members hovering the deck',
      resolve: async ({id: stageId}) => {
        const redis = getRedis()
        const userIds = await redis.smembers(`pokerHover:${stageId}`)
        return userIds
      }
    },
    hoveringUsers: {
      type: GraphQLNonNull(GraphQLList(GraphQLNonNull(User))),
      description: 'the users of the team members hovering the deck',
      resolve: async ({id: stageId}) => {
        const redis = getRedis()
        const userIds = await redis.smembers(`pokerHover:${stageId}`)
        if (userIds.length === 0) return []
        const users = await db.readMany('User', userIds)
        return users
      }
    },
    scores: {
      type: GraphQLNonNull(GraphQLList(GraphQLNonNull(EstimateUserScore))),
      description: 'all the estimates, 1 per user',
      resolve: ({id: stageId, scores}) => {
        return scores.map((score) => ({
          ...score,
          stageId
        }))
      }
    },
    story: {
      type: Story,
      description:
        'the story referenced in the stage. Either a Parabol Task or something similar from an integration. Null if fetching from service failed',
      resolve: async ({service, serviceTaskId, teamId, creatorUserId}, _args, {dataLoader}) => {
        if (service === 'jira') {
          const {cloudId, issueKey} = JiraServiceTaskId.split(serviceTaskId)
          return dataLoader
            .get('jiraIssue')
            .load({cloudId, issueKey, teamId, userId: creatorUserId})
        } else if (service === 'github') {
          return ''
        } else if (service === 'PARABOL') {
          return dataLoader.get('tasks').load(serviceTaskId)
        }
        console.log('EstimateStage story has no service')
        return null
      }
    },
    isVoting: {
      type: GraphQLNonNull(GraphQLBoolean),
      description:
        'true when the participants are still voting and results are hidden. false when votes are revealed'
    }
  })
})

export default EstimateStage
