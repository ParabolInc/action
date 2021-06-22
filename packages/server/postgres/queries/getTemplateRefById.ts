import getPg from '../getPg'
import {
  getTemplateRefByIdQuery,
  IGetTemplateRefByIdQueryResult
} from './generated/getTemplateRefByIdQuery'

interface TemplateRef extends IGetTemplateRefByIdQueryResult {
  dimensions: {
    name: string
    scaleRefId: string
  }[]
}

const getTemplateRefById = async (templateRefId: string) => {
  const [templateRef] = await getTemplateRefByIdQuery.run({refId: templateRefId}, getPg())
  return templateRef as TemplateRef
}
export default getTemplateRefById
