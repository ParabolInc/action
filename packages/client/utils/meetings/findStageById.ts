
export interface FindStageByIdStage {
  id: string
  [key: string]: any
}

export interface FindStageByIdPhase {
  stages: readonly FindStageByIdStage[]
  [key: string]: any
}


const findStageById = <T extends FindStageByIdPhase>(
  phases: T[] | readonly T[] | null | undefined,
  foreignKey: string,
  stageKey = 'id'
) => {
  if (!phases) return undefined
  for (let ii = 0; ii < phases.length; ii++) {
    const phase = phases[ii]
    const {stages} = phase
    for (let jj = 0; jj < stages.length; jj++) {
      const stage = stages[jj] as T['stages'][0] & FindStageByIdStage
      if (stage[stageKey] === foreignKey) {
        return {phase, stage, stageIdx: jj}
      }
    }
  }
  return undefined
}

export default findStageById
