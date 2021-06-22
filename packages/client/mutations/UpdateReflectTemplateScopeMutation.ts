import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {ConnectionHandler, RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import {SharedUpdater, StandardMutation} from '../types/relayMutations'
import addNodeToArray from '../utils/relay/addNodeToArray'
import getBaseRecord from '../utils/relay/getBaseRecord'
import getCachedRecord from '../utils/relay/getCachedRecord'
import getNodeById from '../utils/relay/getNodeById'
import {insertEdgeAfter} from '../utils/relay/insertEdge'
import safeRemoveNodeFromArray from '../utils/relay/safeRemoveNodeFromArray'
import safeRemoveNodeFromConn from '../utils/relay/safeRemoveNodeFromConn'
import {UpdateReflectTemplateScopeMutation as TUpdateTemplateScopeMutation} from '../__generated__/UpdateReflectTemplateScopeMutation.graphql'
import {
  SharingScopeEnum,
  UpdateReflectTemplateScopeMutation_organization
} from '../__generated__/UpdateReflectTemplateScopeMutation_organization.graphql'
import getReflectTemplateOrgConn from './connections/getReflectTemplateOrgConn'

graphql`
  fragment UpdateReflectTemplateScopeMutation_organization on UpdateTemplateScopeSuccess {
    template {
      # these fragments are needed for listening org members
      ...TemplateSharing_template
      ...ReflectTemplateDetailsTemplate
      id
      orgId
      scope
      teamId
    }
    clonedTemplate {
      ...TemplateSharing_template
      ...ReflectTemplateDetailsTemplate
      orgId
    }
  }
`

const mutation = graphql`
  mutation UpdateReflectTemplateScopeMutation($templateId: ID!, $scope: SharingScopeEnum!) {
    updateTemplateScope(templateId: $templateId, scope: $scope) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...UpdateReflectTemplateScopeMutation_organization @relay(mask: false)
    }
  }
`

const removeTemplateFromCurrentScope = (
  templateId: string,
  scopeList: SharingScopeEnum,
  meetingSettings: RecordProxy
) => {
  if (scopeList === 'TEAM') {
    safeRemoveNodeFromArray(templateId, meetingSettings, 'teamTemplates')
  } else if (scopeList === 'ORGANIZATION') {
    const orgTemplatesConn = getReflectTemplateOrgConn(meetingSettings)
    safeRemoveNodeFromConn(templateId, orgTemplatesConn)
  }
  // not possible for the public list to get mutated because this is an org subscription
}

const putTemplateInConnection = (
  template: RecordProxy,
  connection: RecordProxy | null | undefined,
  store: RecordSourceSelectorProxy
) => {
  const templateId = template.getValue('id')
  if (connection && !getNodeById(templateId as string, connection)) {
    const newEdge = ConnectionHandler.createEdge(store, connection, template, 'ReflectTemplateEdge')
    newEdge.setValue(templateId, 'cursor')
    insertEdgeAfter(connection, newEdge)
  }
}

const addTemplateToScope = (
  template: RecordProxy,
  scope: SharingScopeEnum,
  meetingSettings: RecordProxy,
  store: RecordSourceSelectorProxy
) => {
  if (scope === 'TEAM') {
    addNodeToArray(template, meetingSettings, 'teamTemplates')
  } else if (scope === 'ORGANIZATION') {
    const orgTemplatesConn = getReflectTemplateOrgConn(meetingSettings)
    putTemplateInConnection(template, orgTemplatesConn, store)
  }
}

const SCOPES = ['TEAM', 'ORGANIZATION', 'PUBLIC']
const handleUpdateTemplateScope = (
  template: RecordProxy,
  newScope: SharingScopeEnum,
  store: RecordSourceSelectorProxy,
  clonedTemplate?: RecordProxy
) => {
  const templateId = template.getValue('id') as string
  const nextTemplate = clonedTemplate || template
  const templateTeamId = nextTemplate.getValue('teamId')
  const nextTemplateOrgId = nextTemplate.getValue('orgId')
  const oldTemplate = getBaseRecord(store, templateId)
  // default to TEAM in case the template belongs to another TEAM & therefore didn't exist before this upscope
  const oldScope = oldTemplate?.scope ?? 'TEAM'
  const isDecreasing = SCOPES.indexOf(oldScope) > SCOPES.indexOf(newScope)
  const filterFn = (obj) => obj && obj.__typename === 'Team' && obj.orgId === nextTemplateOrgId
  const teamRecords = getCachedRecord(store, filterFn, {isPlural: true})
  const teamIds = teamRecords.map(({id}) => id)
  teamIds.forEach((teamId) => {
    const team = store.get(teamId)
    if (!team) return
    const meetingSettings = team.getLinkedRecord('meetingSettings', {meetingType: 'retrospective'})
    if (!meetingSettings) return
    // this is on the ORG subscription, so this won't affect anything on a PUBLIC list because they're at least on the same org
    const scopeList = teamId === templateTeamId ? 'TEAM' : 'ORGANIZATION'
    if (scopeList === 'TEAM') {
      if (clonedTemplate) {
        removeTemplateFromCurrentScope(templateId, scopeList, meetingSettings)
        addTemplateToScope(nextTemplate, scopeList, meetingSettings, store)
      }
    } else if (scopeList === 'ORGANIZATION') {
      if (isDecreasing) {
        removeTemplateFromCurrentScope(templateId, scopeList, meetingSettings)
      } else {
        addTemplateToScope(nextTemplate, scopeList, meetingSettings, store)
      }
    }
  })
}

export const updateTemplateScopeOrganizationUpdater: SharedUpdater<UpdateReflectTemplateScopeMutation_organization> = (
  payload: any,
  {store}
) => {
  const template = payload.getLinkedRecord('template')
  if (!template) return
  const clonedTemplate = payload.getLinkedRecord('clonedTemplate')
  const nextTemplate = clonedTemplate || template
  const newScope = nextTemplate.getValue('scope')
  handleUpdateTemplateScope(template, newScope, store, clonedTemplate)
}

const UpdateReflectTemplateScopeMutation: StandardMutation<TUpdateTemplateScopeMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TUpdateTemplateScopeMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('updateTemplateScope')
      if (!payload) return
      updateTemplateScopeOrganizationUpdater(payload as any, {atmosphere, store})
    },
    optimisticUpdater: (store) => {
      const {scope, templateId} = variables
      const template = store.get(templateId)
      if (!template) return
      template.setValue(scope, 'scope')
      handleUpdateTemplateScope(template, scope, store)
    },
    onCompleted,
    onError
  })
}

export default UpdateReflectTemplateScopeMutation
