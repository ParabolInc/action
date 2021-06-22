import {SprintPokerDefaults} from 'parabol-client/types/constEnums'
import getRethink from '../database/rethinkDriver'
import JiraDimensionField from '../database/types/JiraDimensionField'
import {DataLoaderWorker} from '../graphql/graphql'
import AtlassianServerManager from './AtlassianServerManager'
import catchAndLog from '../postgres/utils/catchAndLog'
import {
  IMergeTeamJiraDimensionFieldsQueryParams,
  mergeTeamJiraDimensionFieldsQuery
} from '../postgres/queries/generated/mergeTeamJiraDimensionFieldsQuery'
import getPg from '../postgres/getPg'

const ensureJiraDimensionField = async (
  requiredMappers: {cloudId: string; projectKey: string; issueKey: string; dimensionName: string}[],
  teamId: string,
  userId: string,
  dataLoader: DataLoaderWorker
) => {
  if (requiredMappers.length === 0) return
  const team = await dataLoader.get('teams').load(teamId)
  const currentMappers = team.jiraDimensionFields || []
  const missingMappers = requiredMappers.filter(({cloudId, projectKey, dimensionName}) => {
    return !currentMappers.find((curMapper) => {
      return (
        curMapper.cloudId === cloudId &&
        curMapper.projectKey === projectKey &&
        curMapper.dimensionName === dimensionName
      )
    })
  })
  const fieldNamesToTry = [
    SprintPokerDefaults.JIRA_FIELD_DEFAULT,
    SprintPokerDefaults.JIRA_FIELD_LEGACY_DEFAULT
  ]
  const auth = await dataLoader.get('freshAtlassianAuth').load({userId, teamId})
  if (!auth) return
  const {accessToken} = auth
  const manager = new AtlassianServerManager(accessToken)
  const newJiraDimensionFields = await Promise.all(
    missingMappers.map(async (mapper) => {
      const {cloudId, projectKey, issueKey, dimensionName} = mapper
      const defaultField = await manager.getFirstValidJiraField(cloudId, fieldNamesToTry, issueKey)
      if (!defaultField) return null
      const {id: fieldId, name: fieldName, schema} = defaultField
      const fieldType = schema.type as 'string' | 'number'
      return new JiraDimensionField({
        cloudId,
        dimensionName,
        fieldId,
        fieldName,
        fieldType,
        projectKey
      })
    })
  )
  const fieldsToAdd = newJiraDimensionFields.filter(Boolean)
  if (fieldsToAdd.length === 0) return
  const r = await getRethink()
  await Promise.all([
    r
      .table('Team')
      .get(teamId)
      .update((team) => ({
        jiraDimensionFields: team('jiraDimensionFields')
          .default([])
          .union(fieldsToAdd)
      }))
      .run(),
    catchAndLog(() =>
      mergeTeamJiraDimensionFieldsQuery.run(
        ({
          jiraDimensionFields: fieldsToAdd,
          id: teamId
        } as unknown) as IMergeTeamJiraDimensionFieldsQueryParams,
        getPg()
      )
    )
  ])
}

export default ensureJiraDimensionField
