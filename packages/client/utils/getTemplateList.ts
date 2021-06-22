import graphql from 'babel-plugin-relay/macro'
import {readInlineData} from 'relay-runtime'
import {getTemplateList_template} from '../__generated__/getTemplateList_template.graphql'
import * as Sentry from '@sentry/browser'

const getTemplateList = (viewerTeamId: string, viewerOrgId: string, templateRef: any) => {
  const template = readInlineData<getTemplateList_template>(
    graphql`
      fragment getTemplateList_template on MeetingTemplate @inline {
        id
        team {
          id
          orgId
        }
      }
    `,
    templateRef
  )
  const {id: templateId, team} = template
  if (!team) {
    // https://sentry.io/share/issue/3e6e31cb053b44689eddd531858f1081/
    Sentry.captureException(new Error(`NO TEAM ON TEMPLATE WTF. ${viewerTeamId}, ${templateId}`))
    return 'TEAM'
  }
  const {id: teamId, orgId} = team
  return teamId === viewerTeamId ? 'TEAM' : orgId === viewerOrgId ? 'ORGANIZATION' : 'PUBLIC'
}

export default getTemplateList
