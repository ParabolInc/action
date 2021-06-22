import {DataLoaderWorker} from '../../graphql'
import AtlassianServerManager from '../../../utils/AtlassianServerManager'
import makeJiraProjectName from 'parabol-client/utils/makeJiraProjectName'
import makeSuggestedIntegrationId from 'parabol-client/utils/makeSuggestedIntegrationId'
import {TaskServiceEnum} from '../../../database/types/Task'

const fetchAtlassianProjects = async (
  dataLoader: DataLoaderWorker,
  teamId: string,
  userId: string
) => {
  const auth = await dataLoader.get('freshAtlassianAuth').load({teamId, userId})
  if (!auth) return []
  const {accessToken} = auth
  const manager = new AtlassianServerManager(accessToken)
  const sites = await manager.getAccessibleResources()

  if ('message' in sites) {
    console.error(sites)
    return []
  }

  const cloudIds = sites.map((site) => site.id)
  const atlassianProjects = [] as any
  const service: TaskServiceEnum = 'jira'
  await manager.getProjects(cloudIds, (err, res) => {
    if (err) {
      console.error(err)
    } else if (res) {
      const {cloudId, newProjects} = res
      const newItems = newProjects.map((project) => ({
        // projectId/key is not globally unique, but a cloudId is
        id: makeSuggestedIntegrationId({...project, projectKey: project.key, cloudId, service}),
        service,
        cloudId,
        projectName: makeJiraProjectName(project.name, sites, cloudId),
        projectKey: project.key,
        avatar: project.avatarUrls['24x24']
      }))
      atlassianProjects.push(...newItems)
    }
  })
  return atlassianProjects
}

export default fetchAtlassianProjects
