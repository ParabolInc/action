import getPg from '../getPg'
import {
  getTemplateScaleRefByIdQuery,
  IGetTemplateScaleRefByIdQueryResult
} from './generated/getTemplateScaleRefByIdQuery'

interface TemplateScaleRef extends IGetTemplateScaleRefByIdQueryResult {
  values: {
    color: string
    label: string
  }[]
}

const getTemplateScaleRefById = async (scaleRefId: string) => {
  const [templateScaleRef] = await getTemplateScaleRefByIdQuery.run({scaleRefId}, getPg())
  return templateScaleRef as TemplateScaleRef
}
export default getTemplateScaleRefById
