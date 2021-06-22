import {PALETTE} from '../../../client/styles/paletteV3'
import {PokerCards} from '../../../client/types/constEnums'
import generateUID from '../../generateUID'
import TemplateScaleValue from './TemplateScaleValue'

export interface TemplateScaleInput {
  teamId: string
  sortOrder: number
  name: string
  values?: TemplateScaleValue[]
  parentScaleId?: string
  isStarter?: boolean
  removedAt?: Date
}

const questionMarkCard = new TemplateScaleValue({
  color: PALETTE.FUSCIA_400,
  label: PokerCards.QUESTION_CARD as string
})
const passCard = new TemplateScaleValue({
  color: PALETTE.GRAPE_500,
  label: PokerCards.PASS_CARD as string
})

export default class TemplateScale {
  id: string
  createdAt = new Date()
  name: string
  sortOrder: number
  values: TemplateScaleValue[]
  teamId: string
  updatedAt = new Date()
  parentScaleId?: string
  isStarter?: boolean
  removedAt?: Date

  constructor(input: TemplateScaleInput) {
    const {name, sortOrder, values, teamId, parentScaleId, isStarter, removedAt} = input
    this.id = generateUID()
    this.sortOrder = sortOrder
    this.name = name
    this.values = values || [questionMarkCard, passCard]
    this.teamId = teamId
    this.parentScaleId = parentScaleId
    this.isStarter = isStarter
    this.removedAt = removedAt
  }
}
