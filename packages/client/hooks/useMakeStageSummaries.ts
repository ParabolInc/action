import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {readInlineData} from 'react-relay'
import JiraServiceTaskId from '../shared/gqlIds/JiraServiceTaskId'
import {
  TaskServiceEnum,
  useMakeStageSummaries_phase
} from '../__generated__/useMakeStageSummaries_phase.graphql'

interface StageSummary {
  title: string
  subtitle: string
  isComplete: boolean
  isNavigable: boolean
  isActive: boolean
  sortOrder: number
  stageIds: string[]
  finalScores: (string | null)[]
}

const getIssueKey = (service: TaskServiceEnum, serviceTaskId: string) => {
  switch (service) {
    case 'jira':
      return JiraServiceTaskId.split(serviceTaskId).issueKey
    case 'PARABOL':
      return ''
    case 'github':
      return serviceTaskId
    default:
      return ''
  }
}

const useMakeStageSummaries = (phaseRef: any, localStageId: string) => {
  const estimatePhase = readInlineData<useMakeStageSummaries_phase>(
    graphql`
      fragment useMakeStageSummaries_phase on EstimatePhase @inline {
        phaseType
        stages {
          id
          finalScore
          isComplete
          isNavigable
          sortOrder
          service
          serviceTaskId
          story {
            id
            title
          }
        }
      }
    `,
    phaseRef
  )
  return useMemo(() => {
    const {stages} = estimatePhase
    const serviceTaskSet = new Set<string>()
    const summaries = [] as StageSummary[]
    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i]
      const {serviceTaskId, story, service} = stage
      const batch = [stage]
      for (let j = i + 1; j < stages.length; j++) {
        const nextStage = stages[j]
        if (nextStage.serviceTaskId !== serviceTaskId) break
        batch.push(nextStage)
      }
      const issueKey = getIssueKey(service, serviceTaskId)
      const rawTitle = story?.title ?? null
      const title = rawTitle ?? issueKey ?? 'Unknown Story'
      const subtitle = rawTitle ? issueKey : ''

      summaries.push({
        title,
        subtitle,
        isComplete: batch.every(({isComplete}) => isComplete),
        isNavigable: batch.some(({isNavigable}) => isNavigable),
        isActive: !!batch.find(({id}) => id === localStageId),
        sortOrder: stage.sortOrder,
        stageIds: batch.map(({id}) => id),
        finalScores: batch.map(({finalScore}) => finalScore)
      })
      serviceTaskSet.add(serviceTaskId)
      i += batch.length - 1
    }
    return summaries
  }, [phaseRef, localStageId])
}

export default useMakeStageSummaries
