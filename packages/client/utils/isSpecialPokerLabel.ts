import {PokerCards} from '../types/constEnums'

const SPECIAL_CARDS = [PokerCards.QUESTION_CARD, PokerCards.PASS_CARD]
const isSpecialPokerLabel = (label: string) => SPECIAL_CARDS.includes(label as any)
export default isSpecialPokerLabel
