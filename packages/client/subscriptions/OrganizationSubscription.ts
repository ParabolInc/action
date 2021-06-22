import graphql from 'babel-plugin-relay/macro'
import {RouterProps} from 'react-router'
import {requestSubscription, Variables} from 'relay-runtime'
import {
  archiveOrganizationOrganizationOnNext,
  archiveOrganizationOrganizationUpdater
} from '~/mutations/ArchiveOrganizationMutation'
import {OrganizationSubscriptionResponse} from '~/__generated__/OrganizationSubscription.graphql'
import Atmosphere from '../Atmosphere'
import {addOrgMutationOrganizationUpdater} from '../mutations/AddOrgMutation'
import {
  removeOrgUserOrganizationOnNext,
  removeOrgUserOrganizationUpdater
} from '../mutations/RemoveOrgUserMutation'
import {
  setOrgUserRoleAddedOrganizationOnNext,
  setOrgUserRoleAddedOrganizationUpdater
} from '../mutations/SetOrgUserRoleMutation'
import {updateTemplateScopeOrganizationUpdater} from '../mutations/UpdateReflectTemplateScopeMutation'

const subscription = graphql`
  subscription OrganizationSubscription {
    organizationSubscription {
      __typename
      ...AddOrgMutation_organization @relay(mask: false)
      ...ArchiveOrganizationMutation_organization @relay(mask: false)
      ...PayLaterMutation_organization @relay(mask: false)
      ...SetOrgUserRoleMutationAdded_organization @relay(mask: false)
      ...SetOrgUserRoleMutationRemoved_organization @relay(mask: false)
      ...UpdateCreditCardMutation_organization @relay(mask: false)
      ...UpdateOrgMutation_organization @relay(mask: false)
      ...UpgradeToProMutation_organization @relay(mask: false)
      ...RemoveOrgUserMutation_organization @relay(mask: false)
      ...UpdateReflectTemplateScopeMutation_organization @relay(mask: false)
    }
  }
`

const onNextHandlers = {
  ArchiveOrganizationPayload: archiveOrganizationOrganizationOnNext,
  RemoveOrgUserPayload: removeOrgUserOrganizationOnNext,
  SetOrgUserRoleAddedPayload: setOrgUserRoleAddedOrganizationOnNext
}

const updateHandlers = {
  AddOrgPayload: addOrgMutationOrganizationUpdater,
  ArchiveOrganizationPayload: archiveOrganizationOrganizationUpdater,
  SetOrgUserRoleAddedPayload: setOrgUserRoleAddedOrganizationUpdater,
  RemoveOrgUserPayload: removeOrgUserOrganizationUpdater,
  UpdateTemplateScopeSuccess: updateTemplateScopeOrganizationUpdater,
}

const OrganizationSubscription = (
  atmosphere: Atmosphere,
  variables: Variables,
  router: {history: RouterProps['history']}
) => {
  return requestSubscription<OrganizationSubscriptionResponse>(atmosphere, {
    subscription,
    variables,
    updater: (store) => {
      const payload = store.getRootField('organizationSubscription') as any
      if (!payload) return
      const type = payload.getValue('__typename') as string
      const handler = updateHandlers[type]
      if (handler) {
        handler(payload, {atmosphere, store})
      }
    },
    onNext: (result) => {
      if (!result) return
      const {organizationSubscription} = result
      const {__typename: type} = organizationSubscription
      const handler = onNextHandlers[type]
      if (handler) {
        handler(organizationSubscription, {...router, atmosphere})
      }
    },
    onCompleted: () => {
      atmosphere.unregisterSub(OrganizationSubscription.name, variables)
    }
  })
}
OrganizationSubscription.key = 'organization'
export default OrganizationSubscription
