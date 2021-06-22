import {R} from 'rethinkdb-ts'

const oldDataDate = new Date('2020-11-04')
const newDataDate = new Date()
const MAX_32_BIT_INTEGER = Math.pow(2, 31) - 1
const oldScales = [
  {
    id: 'fibonacciScale',
    createdAt: oldDataDate,
    updatedAt: oldDataDate,
    name: 'Fibonacci',
    isStarter: true,
    sortOrder: 0,
    values: [
      {color: '#E55CA0', label: '?', value: -1, isSpecial: true},
      {color: '#5CA0E5', label: '1', value: 1},
      {color: '#5CA0E5', label: '2', value: 2},
      {color: '#45E595', label: '3', value: 3},
      {color: '#45E595', label: '5', value: 5},
      {color: '#45E595', label: '8', value: 8},
      {color: '#E59545', label: '13', value: 13},
      {color: '#E59545', label: '21', value: 21},
      {color: '#E59545', label: '34', value: 34},
      {color: '#AC72E5', label: 'X', value: MAX_32_BIT_INTEGER, isSpecial: true}
    ],
    teamId: 'aGhostTeam'
  },
  {
    id: 'tshirtSizeScale',
    createdAt: oldDataDate,
    updatedAt: oldDataDate,
    name: 'T-Shirt Sizes',
    isStarter: true,
    sortOrder: 1,
    values: [
      {color: '#E55CA0', label: '?', value: -1, isSpecial: true},
      {color: '#5CA0E5', label: 'XS', value: 1},
      {color: '#5CA0E5', label: 'SM', value: 2},
      {color: '#45E595', label: 'M', value: 3},
      {color: '#E59545', label: 'L', value: 4},
      {color: '#E59545', label: 'XL', value: 5},
      {color: '#AC72E5', label: 'X', value: MAX_32_BIT_INTEGER, isSpecial: true}
    ],
    teamId: 'aGhostTeam'
  },
  {
    id: 'fiveFingersScale',
    createdAt: oldDataDate,
    updatedAt: oldDataDate,
    name: 'Five Fingers',
    isStarter: true,
    sortOrder: 2,
    values: [
      {color: '#E55CA0', label: '?', value: -1, isSpecial: true},
      {color: '#5CA0E5', label: '1', value: 1},
      {color: '#5CA0E5', label: '2', value: 2},
      {color: '#45E595', label: '3', value: 3},
      {color: '#E59545', label: '4', value: 4},
      {color: '#E59545', label: '5', value: 5},
      {color: '#AC72E5', label: 'X', value: MAX_32_BIT_INTEGER, isSpecial: true}
    ],
    teamId: 'aGhostTeam'
  }
]

const newScales = [
  {
    id: 'fibonacciScale',
    createdAt: newDataDate,
    updatedAt: newDataDate,
    name: 'Fibonacci',
    isStarter: true,
    sortOrder: 0,
    values: [
      {color: '#5CA0E5', label: '1'},
      {color: '#5CA0E5', label: '2'},
      {color: '#45E595', label: '3'},
      {color: '#45E595', label: '5'},
      {color: '#45E595', label: '8'},
      {color: '#E59545', label: '13'},
      {color: '#E59545', label: '21'},
      {color: '#E59545', label: '34'},
      {color: '#E55CA0', label: '?', isSpecial: true},
      {color: '#AC72E5', label: 'Pass', isSpecial: true}
    ],
    teamId: 'aGhostTeam'
  },
  {
    id: 'tshirtSizeScale',
    createdAt: newDataDate,
    updatedAt: newDataDate,
    name: 'T-Shirt Sizes',
    isStarter: true,
    sortOrder: 1,
    values: [
      {color: '#5CA0E5', label: 'XS'},
      {color: '#5CA0E5', label: 'SM'},
      {color: '#45E595', label: 'M'},
      {color: '#E59545', label: 'L'},
      {color: '#E59545', label: 'XL'},
      {color: '#E55CA0', label: '?', isSpecial: true},
      {color: '#AC72E5', label: 'Pass', isSpecial: true}
    ],
    teamId: 'aGhostTeam'
  },
  {
    id: 'fiveFingersScale',
    createdAt: newDataDate,
    updatedAt: newDataDate,
    name: 'Five Fingers',
    isStarter: true,
    sortOrder: 2,
    values: [
      {color: '#5CA0E5', label: '1'},
      {color: '#5CA0E5', label: '2'},
      {color: '#45E595', label: '3'},
      {color: '#E59545', label: '4'},
      {color: '#E59545', label: '5'},
      {color: '#E55CA0', label: '?', isSpecial: true},
      {color: '#AC72E5', label: 'Pass', isSpecial: true}
    ],
    teamId: 'aGhostTeam'
  }
]

export const up = async function(r: R) {
  try {
    // clear TemplateScale table
    await r
      .table('TemplateScale')
      .delete()
      .run()

    // insert new data to TemplateScale table
    await r
      .table('TemplateScale')
      .insert(newScales)
      .run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function(r: R) {
  const MAX_32_BIT_INTEGER = Math.pow(2, 31) - 1
  try {
    // clear TemplateScale table
    await r
      .table('TemplateScale')
      .delete()
      .run()

    // insert old data to TemplateScale table
    await r
      .table('TemplateScale')
      .insert(oldScales)
      .run()
  } catch (e) {
    console.log(e)
  }
}
