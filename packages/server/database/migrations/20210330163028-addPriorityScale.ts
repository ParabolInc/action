import {R} from 'rethinkdb-ts'
import {PokerCards} from 'parabol-client/types/constEnums'
import {PALETTE} from 'parabol-client/styles/paletteV3'

const priorityScaleId = 'priorityScale'
const priorityScale = [
  {
    id: priorityScaleId,
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Priorities',
    isStarter: true,
    sortOrder: 3,
    values: [
      {color: PALETTE.FUSCIA_400, label: PokerCards.QUESTION_CARD},
      {color: PALETTE.SKY_500, label: 'P0'},
      {color: PALETTE.SKY_500, label: 'P1'},
      {color: PALETTE.JADE_400, label: 'P2'},
      {color: PALETTE.JADE_400, label: 'P3'},
      {color: PALETTE.TERRA_300, label: 'P4'},
      {color: PALETTE.TERRA_300, label: 'P5'},
      {color: PALETTE.GRAPE_500, label: PokerCards.PASS_CARD}
    ],
    teamId: 'aGhostTeam'
  }
]

export const up = async function(r: R) {
  try {
    await r
      .table('TemplateScale')
      .insert(priorityScale)
      .run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function(r: R) {
  try {
    await r
      .table('TemplateScale')
      .get(priorityScaleId)
      .delete()
      .run()
  } catch (e) {
    console.log(e)
  }
}
