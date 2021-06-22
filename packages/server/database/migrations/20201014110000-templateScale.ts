import {R} from 'rethinkdb-ts'

const oldDataDate = new Date('2020-08-24')
const newDataDate = new Date()

const oldScales = [
  {
    id: 'fibonacciScale',
    createdAt: oldDataDate,
    updatedAt: oldDataDate,
    name: 'Fibonacci',
    values: ['1', '2', '3', '5', '8', '13', '21', '34'],
    teamId: 'aGhostTeam'
  },
  {
    id: 'tshirtSizeScale',
    createdAt: oldDataDate,
    updatedAt: oldDataDate,
    name: 'T-Shirt Sizes',
    values: ['XS', 'SM', 'M', 'L', 'XL'],
    teamId: 'aGhostTeam'
  },
  {
    id: 'fiveFingersScale',
    createdAt: oldDataDate,
    updatedAt: oldDataDate,
    name: 'Five Fingers',
    values: ['1', '2', '3', '4', '5'],
    teamId: 'aGhostTeam'
  }
]

const oldDimensions = [
  {
    createdAt: oldDataDate,
    id: 'wsjfStoryPointsDimension',
    name: 'Story Points',
    scaleId: 'fibonacciScale',
    teamId: 'aGhostTeam',
    templateId: 'wsjfTemplate',
    updatedAt: oldDataDate
  },
  {
    createdAt: oldDataDate,
    id: 'eeStoryPointsDimension',
    name: 'Story Points',
    scaleId: 'fibonacciScale',
    teamId: 'aGhostTeam',
    templateId: 'estimatedEffortTemplate',
    updatedAt: oldDataDate
  },
  {
    createdAt: oldDataDate,
    id: 'wsjfStoryValueDimension',
    name: 'Story Value',
    scaleId: 'fibonacciScale',
    teamId: 'aGhostTeam',
    templateId: 'wsjfTemplate',
    updatedAt: oldDataDate
  }
]

const oldPokerTemplates = [
  {
    createdAt: oldDataDate,
    id: 'estimatedEffortTemplate',
    isActive: true,
    name: 'Estimated Effort',
    orgId: 'aGhostOrg',
    scope: 'PUBLIC',
    teamId: 'aGhostTeam',
    updatedAt: newDataDate
  },
  {
    createdAt: oldDataDate,
    id: 'wsjfTemplate',
    isActive: true,
    name: 'Weighted Shortest Job First',
    orgId: 'aGhostOrg',
    scope: 'PUBLIC',
    teamId: 'aGhostTeam',
    updatedAt: oldDataDate
  }
]

const MAX_32_BIT_INTEGER = Math.pow(2, 31) - 1
const newScales = [
  {
    id: 'fibonacciScale',
    createdAt: newDataDate,
    updatedAt: newDataDate,
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
    createdAt: newDataDate,
    updatedAt: newDataDate,
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
    createdAt: newDataDate,
    updatedAt: newDataDate,
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

const newDimensions = [
  {
    createdAt: newDataDate,
    updatedAt: newDataDate,
    id: 'eeStoryPointsDimension',
    name: 'Story Points',
    scaleId: 'tshirtSizeScale',
    teamId: 'aGhostTeam',
    templateId: 'estimatedEffortTemplate',
    sortOrder: 0
  },
  {
    createdAt: newDataDate,
    updatedAt: newDataDate,
    id: 'eeStoryValueDimension',
    name: 'Story Value',
    scaleId: 'fibonacciScale',
    teamId: 'aGhostTeam',
    templateId: 'estimatedEffortTemplate',
    sortOrder: 1
  }
]

const newPokerTemplates = [
  {
    createdAt: newDataDate,
    id: 'estimatedEffortTemplate',
    isActive: true,
    isStarter: true,
    name: 'Estimated Effort & Value',
    orgId: 'aGhostOrg',
    scope: 'PUBLIC',
    teamId: 'aGhostTeam',
    type: 'poker',
    updatedAt: newDataDate
  }
]

export const up = async function(r: R) {
  try {
    // create index 'teamId' for table TemplateScale
    await r
      .table('TemplateScale')
      .indexCreate('teamId')
      .run()

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

    // create index 'teamId' for TemplateDimension table
    await r
      .table('TemplateDimension')
      .indexCreate('teamId')
      .run()

    // clear TemplateDimension table
    await r
      .table('TemplateDimension')
      .delete()
      .run()

    // insert new data to TemplateDimension table
    await r
      .table('TemplateDimension')
      .insert(newDimensions)
      .run()

    // clear poker template data in MeetingTemplate table
    await r
      .table('MeetingTemplate')
      .filter((template) =>
        r.expr(['estimatedEffortTemplate', 'wsjfTemplate']).contains(template('id'))
      )
      .delete()
      .run()

    // insert new poker template data to MeetingTemplate table
    await r
      .table('MeetingTemplate')
      .insert(newPokerTemplates)
      .run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function(r: R) {
  try {
    // drop index 'teamId' for table TemplateScale
    await r
      .table('TemplateScale')
      .indexDrop('teamId')
      .run()

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

    // drop index 'teamId' for TemplateDimension table
    await r
      .table('TemplateDimension')
      .indexDrop('teamId')
      .run()

    // clear TemplateDimension table
    await r
      .table('TemplateDimension')
      .delete()
      .run()

    // insert old data to TemplateDimension table
    await r
      .table('TemplateDimension')
      .insert(oldDimensions)
      .run()

    // clear poker template data in MeetingTemplate table
    await r
      .table('MeetingTemplate')
      .filter((template) =>
        r.expr(['estimatedEffortTemplate', 'wsjfTemplate']).contains(template('id'))
      )
      .delete()
      .run()

    // insert old poker template data to MeetingTemplate table
    await r
      .table('MeetingTemplate')
      .insert(oldPokerTemplates)
      .run()
  } catch (e) {
    console.log(e)
  }
}
