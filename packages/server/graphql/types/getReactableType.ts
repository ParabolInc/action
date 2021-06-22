import {ReactableEnum} from '../../database/types/Reactable'

const getReactableType = (type: any): ReactableEnum => {
  return type.reflectionGroupId ? 'REFLECTION' : 'COMMENT'
}

export default getReactableType
