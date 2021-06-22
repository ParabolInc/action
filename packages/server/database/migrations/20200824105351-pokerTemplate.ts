import {R} from 'rethinkdb-ts'

const createdAt = new Date('2020-08-24')
const templates = [
  {
    createdAt: createdAt,
    id: 'estimatedEffortTemplate',
    isActive: true,
    name: 'Estimated Effort',
    teamId: 'aGhostTeam',
    updatedAt: createdAt,
    scope: 'PUBLIC',
    orgId: 'aGhostOrg'
  },
  {
    createdAt: createdAt,
    id: 'wsjfTemplate',
    isActive: true,
    name: 'Weighted Shortest Job First',
    teamId: 'aGhostTeam',
    updatedAt: createdAt,
    scope: 'PUBLIC',
    orgId: 'aGhostOrg'
  }
]

const dimensions = [
  {
    id: 'eeStoryPointsDimension',
    name: 'Story Points',
    teamId: 'aGhostTeam',
    templateId: 'estimatedEffortTemplate',
    scaleId: 'fibonacciScale',
    createdAt,
    updatedAt: createdAt
  },
  {
    id: 'wsjfStoryPointsDimension',
    name: 'Story Points',
    teamId: 'aGhostTeam',
    templateId: 'wsjfTemplate',
    scaleId: 'fibonacciScale',
    createdAt,
    updatedAt: createdAt
  },
  {
    id: 'wsjfStoryValueDimension',
    name: 'Story Value',
    teamId: 'aGhostTeam',
    templateId: 'wsjfTemplate',
    scaleId: 'fibonacciScale',
    createdAt,
    updatedAt: createdAt
  }
]

const scales = [
  {
    id: 'fibonacciScale',
    createdAt,
    updatedAt: createdAt,
    name: 'Fibonacci',
    values: ['1', '2', '3', '5', '8', '13', '21', '34'],
    teamId: 'aGhostTeam'
  },
  {
    id: 'tshirtSizeScale',
    createdAt,
    updatedAt: createdAt,
    name: 'T-Shirt Sizes',
    values: ['XS', 'SM', 'M', 'L', 'XL'],
    teamId: 'aGhostTeam'
  },
  {
    id: 'fiveFingersScale',
    createdAt,
    updatedAt: createdAt,
    name: 'Five Fingers',
    values: ['1', '2', '3', '4', '5'],
    teamId: 'aGhostTeam'
  }
]

export const up = async function(r: R) {
  let counter = 654
  // all previous templates should be marked as retrospective templates
  try {
    await r
      .table('ReflectTemplate')
      .update({type: 'retrospective'})
      .run()
  } catch (e) {
    console.log(e)
  }

  // rename ReflectTemplate table to MeetingTemplate since we'll use it for both retro and poker
  try {
    await r
      .table('ReflectTemplate')
      .config()
      .update({name: 'MeetingTemplate'})
      .run()
  } catch (e) {
    console.log(e)
  }
  // add initial public templates
  try {
    await Promise.all([
      r
        .table('MeetingTemplate')
        .insert(templates)
        .run(),
      r
        .table('TemplateDimension')
        .insert(dimensions)
        .run(),
      r
        .table('TemplateScale')
        .insert(scales)
        .run()
    ])
  } catch (e) {
    console.log(e)
  }

  try {
    const teamIds = await r
      .table('Team')('id')
      .coerceTo('array')
      .run()
    const settings = teamIds.map((teamId) => ({
      id: `settings:${teamId}:${counter++}`,
      selectedTemplateId: 'estimatedEffortTemplate',
      meetingType: 'poker',
      teamId,
      phaseTypes: ['checkin', 'SCOPE', 'ESTIMATE']
    }))
    await r
      .table('MeetingSettings')
      .insert(settings)
      .run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function(r: R) {
  try {
    await r
      .table('MeetingTemplate')
      .config()
      .update({name: 'ReflectTemplate'})
      .run()
  } catch (e) {
    console.log(e)
  }
  const templateIds = templates.map(({id}) => id)
  const dimensionIds = dimensions.map(({id}) => id)
  const scaleIds = scales.map(({id}) => id)
  try {
    await Promise.all([
      r
        .table('MeetingTemplate')
        .getAll(r.args(templateIds))
        .delete()
        .run(),
      r
        .table('TemplateDimension')
        .getAll(r.args(dimensionIds))
        .delete()
        .run(),
      r
        .table('TemplateScale')
        .getAll(r.args(scaleIds))
        .delete()
        .run()
    ])
  } catch (e) {
    console.log(e)
  }

  try {
    await r
      .table('ReflectTemplate')
      .replace((row) => row.without('type'))
      .run()
  } catch (e) {
    console.log(e)
  }

  try {
    await r
      .table('MeetingSettings')
      .filter({meetingType: 'poker'})
      .delete()
      .run()
  } catch (e) {
    console.log(e)
  }
}
