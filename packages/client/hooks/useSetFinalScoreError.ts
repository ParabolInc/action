import {useEffect} from 'react'
import {commitLocalUpdate} from 'react-relay'
import Atmosphere from '../Atmosphere'
import useAtmosphere from './useAtmosphere'

export const setFinalScoreError = (atmosphere: Atmosphere, stageId: string, error: string) => {
  commitLocalUpdate(atmosphere, (store) => {
    const stage = store.get(stageId)!
    stage.setValue(error, 'finalScoreError')
  })
}

const useSetFinalScoreError = (stageId: string, error: {message: string} | undefined | null) => {
  const atmosphere = useAtmosphere()
  useEffect(() => {
    const nextError = error?.message ?? ''
    setFinalScoreError(atmosphere, stageId, nextError)
  }, [error])
}

export default useSetFinalScoreError
