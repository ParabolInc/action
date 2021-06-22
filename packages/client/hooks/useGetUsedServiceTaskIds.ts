import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {readInlineData} from 'react-relay'
import {useGetUsedServiceTaskIds_phase} from '../__generated__/useGetUsedServiceTaskIds_phase.graphql'

const useGetUsedServiceTaskIds = (phaseRef: any) => {
  return useMemo(() => {
    const estimatePhase = readInlineData<useGetUsedServiceTaskIds_phase>(
      graphql`
      fragment useGetUsedServiceTaskIds_phase on EstimatePhase @inline {
        stages {
          serviceTaskId
        }
      }
    `,
      phaseRef
    )
    const {stages} = estimatePhase
    const usedServiceTaskIds = new Set<string>()
    stages.forEach((stage) => {
      const {serviceTaskId} = stage
      usedServiceTaskIds.add(serviceTaskId)
    })
    return usedServiceTaskIds
  }, [phaseRef])
}

export default useGetUsedServiceTaskIds
