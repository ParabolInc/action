import {R} from 'rethinkdb-ts'

const oldDataDate = new Date('2020-11-04')
const newDataDate = new Date()

const currentDimensions = [
  {
    createdAt: oldDataDate,
    updatedAt: oldDataDate,
    id: 'eeStoryPointsDimension',
    name: 'Story Points',
    scaleId: 'tshirtSizeScale',
    teamId: 'aGhostTeam',
    templateId: 'estimatedEffortTemplate',
    sortOrder: 0
  },
  {
    createdAt: oldDataDate,
    updatedAt: oldDataDate,
    id: 'eeStoryValueDimension',
    name: 'Story Value',
    scaleId: 'fibonacciScale',
    teamId: 'aGhostTeam',
    templateId: 'estimatedEffortTemplate',
    sortOrder: 1
  }
]

const currentPokerTemplates = [
  {
    createdAt: oldDataDate,
    id: 'estimatedEffortTemplate',
    isActive: true,
    isStarter: true,
    name: 'Estimated Effort & Value',
    orgId: 'aGhostOrg',
    scope: 'PUBLIC',
    teamId: 'aGhostTeam',
    type: 'poker',
    updatedAt: oldDataDate
  }
]

const newDimensions = [
  {
    createdAt: newDataDate,
    id: 'wsjfStoryPointsDimension',
    name: 'Story Points',
    scaleId: 'fibonacciScale',
    teamId: 'aGhostTeam',
    templateId: 'wsjfTemplate',
    updatedAt: newDataDate,
    sortOrder: 0
  },
  {
    createdAt: newDataDate,
    id: 'eeStoryPointsDimension',
    name: 'Story Points',
    scaleId: 'fibonacciScale',
    teamId: 'aGhostTeam',
    templateId: 'estimatedEffortTemplate',
    updatedAt: newDataDate,
    sortOrder: 0
  },
  {
    createdAt: newDataDate,
    id: 'wsjfStoryValueDimension',
    name: 'Story Value',
    scaleId: 'fibonacciScale',
    teamId: 'aGhostTeam',
    templateId: 'wsjfTemplate',
    updatedAt: newDataDate,
    sortOrder: 1
  }
]

const newPokerTemplates = [
  {
    createdAt: newDataDate,
    id: 'estimatedEffortTemplate',
    isActive: true,
    isStarter: true,
    name: 'Estimated Effort',
    orgId: 'aGhostOrg',
    scope: 'PUBLIC',
    teamId: 'aGhostTeam',
    type: 'poker',
    updatedAt: newDataDate
  },
  {
    createdAt: newDataDate,
    id: 'wsjfTemplate',
    isActive: true,
    isStarter: true,
    name: 'Weighted Shortest Job First',
    orgId: 'aGhostOrg',
    scope: 'PUBLIC',
    teamId: 'aGhostTeam',
    type: 'poker',
    updatedAt: newDataDate
  }
]

export const up = async function (r: R) {
  try {
    // Delete old template
    await r.table('MeetingTemplate').get('estimatedEffortTemplate').delete().run()

    // Delete old dimensions
    await r
      .table('TemplateDimension')
      .getAll(r.args(['eeStoryPointsDimension', 'eeStoryValueDimension']))
      .delete()
      .run()

    // Insert new dimensions
    await r.table('TemplateDimension').insert(newDimensions).run()

    // Insert new templates
    await r.table('MeetingTemplate').insert(newPokerTemplates).run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function (r: R) {
  try {
    // Delete new template
    await r
      .table('MeetingTemplate')
      .getAll(r.args(['estimatedEffortTemplate', 'wsjfTemplate']))
      .delete()
      .run()

    // Delete new dimensions
    await r
      .table('TemplateDimension')
      .getAll(
        r.args(['eeStoryPointsDimension', 'wsjfStoryValueDimension', 'wsjfStoryPointsDimension'])
      )
      .delete()
      .run()

    // Insert old dimensions
    await r.table('TemplateDimension').insert(currentDimensions).run()

    // Insert old templates
    await r.table('MeetingTemplate').insert(currentPokerTemplates).run()
  } catch (e) {
    console.log(e)
  }
}
