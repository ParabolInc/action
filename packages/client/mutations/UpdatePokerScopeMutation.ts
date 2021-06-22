import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {PALETTE} from '../styles/paletteV3'
import {StandardMutation} from '../types/relayMutations'
import clientTempId from '../utils/relay/clientTempId'
import createProxyRecord from '../utils/relay/createProxyRecord'
import {
  UpdatePokerScopeMutation as TUpdatePokerScopeMutation,
  UpdatePokerScopeMutationResponse
} from '../__generated__/UpdatePokerScopeMutation.graphql'

graphql`
  fragment UpdatePokerScopeMutation_meeting on UpdatePokerScopeSuccess {
    meeting {
      phases {
        ...useMakeStageSummaries_phase
        ... on EstimatePhase {
          stages {
            ...PokerEstimatePhaseStage
            ...PokerCardDeckStage
            ...EstimatePhaseAreaStage
            ...JiraFieldDimensionDropdown_stage
            ...EstimateDimensionColumn_stage
            id
            isNavigableByFacilitator
            service
            serviceTaskId
            sortOrder
            isVoting
            creatorUserId
            dimensionRef {
              name
              scale {
                values {
                  color
                  label
                }
              }
            }
            serviceField {
              name
              type
            }
            scores {
              userId
              label
              stageId
              user {
                picture
                preferredName
              }
            }
          }
        }
      }
    }
  }
`

const mutation = graphql`
  mutation UpdatePokerScopeMutation($meetingId: ID!, $updates: [UpdatePokerScopeItemInput!]!) {
    updatePokerScope(meetingId: $meetingId, updates: $updates) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...UpdatePokerScopeMutation_meeting @relay(mask: false)
    }
  }
`

type Meeting = NonNullable<UpdatePokerScopeMutationResponse['updatePokerScope']['meeting']>

const UpdatePokerScopeMutation: StandardMutation<TUpdatePokerScopeMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TUpdatePokerScopeMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {viewerId} = atmosphere
      const {meetingId, updates} = variables
      const meeting = store.get<Meeting>(meetingId)
      if (!meeting) return
      const teamId = meeting.getValue('teamId') || ''
      const phases = meeting.getLinkedRecords('phases')
      const estimatePhase = phases.find((phase) => phase.getValue('phaseType') === 'ESTIMATE')
      if (!estimatePhase) return
      const stages = estimatePhase.getLinkedRecords('stages')
      const [firstStage] = stages
      const dimensionRefIds = [] as string[]
      if (firstStage) {
        const firstStageServiceTaskId = firstStage.getValue('serviceTaskId')
        const stagesForServiceTaskId = stages.filter(
          (stage) => stage.getValue('serviceTaskId') === firstStageServiceTaskId
        )
        const prevDimensionRefIds = stagesForServiceTaskId.map((stage) => {
          const dimensionRef = stage.getLinkedRecord('dimensionRef')
          return dimensionRef?.getValue('id') ?? ''
        }) as string[]
        dimensionRefIds.push(...prevDimensionRefIds)
      } else {
        const value = createProxyRecord(store, 'TemplateScaleValue', {
          color: PALETTE.SLATE_600,
          label: '#'
        })
        const scale = createProxyRecord(store, 'TemplateScaleRef', {})
        scale.setLinkedRecords([value], 'values')
        const dimensionRefId = clientTempId()
        const dimensionRef = createProxyRecord(store, 'TemplateDimensionRef', {
          id: dimensionRefId,
          name: 'Loading'
        })
        dimensionRef.setLinkedRecord(scale, 'scale')
        dimensionRefIds.push(dimensionRefId)
      }
      updates.forEach((update) => {
        const {service, serviceTaskId, action} = update

        if (action === 'ADD') {
          const stageExists = !!stages.find(
            (stage) => stage.getValue('serviceTaskId') === serviceTaskId
          )
          if (stageExists) return
          const lastSortOrder = stages[stages.length - 1]?.getValue('sortOrder') ?? -1

          const serviceField = createProxyRecord(store, 'ServiceField', {
            name: 'Unknown',
            type: 'number'
          })
          const newStages = dimensionRefIds.map((dimensionRefId, dimensionRefIdx) => {
            const nextEstimateStage = createProxyRecord(store, 'EstimateStage', {
              creatorUserId: viewerId,
              service,
              serviceTaskId,
              sortOrder: lastSortOrder + 1,
              durations: undefined,
              dimensionRefIdx,
              teamId,
              meetingId
            })
            const dimensionRef = store.get(dimensionRefId)
            nextEstimateStage.setLinkedRecords([], 'scores')
            nextEstimateStage.setLinkedRecords([], 'hoveringUsers')
            nextEstimateStage.setLinkedRecord(serviceField, 'serviceField')
            if (dimensionRef) {
              nextEstimateStage.setLinkedRecord(dimensionRef, 'dimensionRef')
            }
            const story = store.get(serviceTaskId)
            if (story) {
              nextEstimateStage.setLinkedRecord(story, 'story')
            }
            return nextEstimateStage
          })

          const nextStages = [...estimatePhase.getLinkedRecords('stages'), ...newStages]
          estimatePhase.setLinkedRecords(nextStages, 'stages')
        } else if (action === 'DELETE') {
          const nextStages = stages.filter(
            (stage) => stage.getValue('serviceTaskId') !== serviceTaskId
          )
          estimatePhase.setLinkedRecords(nextStages, 'stages')
        }
      })
    },
    onCompleted,
    onError
  })
}

export default UpdatePokerScopeMutation
