import db from '../../../db'
import getTemplateScore from '../../../utils/getTemplateScore'

const getScoredTemplates = async (
  templates: {createdAt: Date; id: string}[],
  newHotnessFactor: number
) => {
  const sharedTemplateIds = templates.map(({id}) => id)
  const sharedTemplateEndTimes = await db.readMany('endTimesByTemplateId', sharedTemplateIds)
  const scoreByTemplateId = {} as {[templateId: string]: number}
  templates.forEach((template, idx) => {
    const {id: templateId, createdAt} = template
    const endTimes = sharedTemplateEndTimes[idx]
    scoreByTemplateId[templateId] = getTemplateScore(createdAt, endTimes, newHotnessFactor)
  })
  // mutative, but doesn't matter if we change the sort oder
  templates.sort((a, b) => {
    return scoreByTemplateId[a.id] > scoreByTemplateId[b.id] ? -1 : 1
  })
  return templates
}

export default getScoredTemplates
