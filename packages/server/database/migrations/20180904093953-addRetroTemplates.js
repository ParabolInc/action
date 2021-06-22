import {RETRO_PHASE_ITEM} from 'parabol-client/utils/constants'

exports.up = async (r) => {
  let counter = 199
  try {
    await Promise.all([r.tableCreate('ReflectTemplate').run()])
  } catch (e) { }
  try {
    await Promise.all([
      r
        .table('ReflectTemplate')
        .indexCreate('teamId')
        .run(),
      r
        .table('CustomPhaseItem')
        .indexCreate('teamId')
        .run()
    ])
  } catch (e) { }

  const now = new Date()
  const makeTemplate = (name, teamId) => ({
    id: String(counter++),
    createdAt: now,
    isActive: true,
    name,
    teamId,
    updatedAt: now
  })

  const templateNames = [
    'Working & Stuck',
    'Glad, Sad, Mad',
    'Liked, Learned, Lacked, Longed for',
    'Start Stop Continue',
    'Sailboat'
  ]

  const gladSadMadPrompts = ['Glad', 'Sad', 'Mad']
  const fourLsPrompts = ['Liked', 'Learned', 'Lacked', 'Longed for']
  const startStopContPrompts = ['Start', 'Stop', 'Continue']
  const sailboatPrompts = ['Wind in the sails', 'Anchors', 'Risks']

  const makePrompt = (teamId, templateId, question, sortOrder) => ({
    id: String(counter++),
    createdAt: now,
    phaseItemType: RETRO_PHASE_ITEM,
    isActive: true,
    sortOrder,
    teamId,
    updatedAt: now,
    templateId,
    question,
    title: question
  })

  try {
    // insert all templates
    const teamIds = await r
      .table('Team')('id')
      .run()

    // make templates
    const templatesByTeamId = {}
    const templateInserts = []
    teamIds.forEach((teamId) => {
      templatesByTeamId[teamId] = templateNames.map((name) => makeTemplate(name, teamId))
      templateInserts.push(...templatesByTeamId[teamId])
    })
    await r
      .table('ReflectTemplate')
      .insert(templateInserts)
      .run()

    // put existing prompts into a template
    const retrosCreatedAtDate = new Date('02/12/2018')

    const updatedPhaseItemPromises = teamIds.map((teamId) => {
      const templateId = templatesByTeamId[teamId][0].id
      return r({
        phaseItemUpdates: r
          .table('CustomPhaseItem')
          .getAll(teamId, {index: 'teamId'})
          .update((row) => ({
            templateId,
            createdAt: retrosCreatedAtDate,
            updatedAt: retrosCreatedAtDate,
            sortOrder: r.branch(row('question').eq('What’s working?'), 0, 1)
          })),
        settingsUpdates: r
          .table('MeetingSettings')
          .getAll(teamId, {index: 'teamId'})
          .update({
            selectedTemplateId: templateId
          })
      }).run()
    })
    await Promise.all(updatedPhaseItemPromises)

    // create new prompts
    const phaseItemInserts = []
    teamIds.forEach((teamId) => {
      // skip the existing working/stuck template
      const [, gladSadMad, fourL, startStopCont, sail] = templatesByTeamId[teamId]
      const glads = gladSadMadPrompts.map((question, idx) =>
        makePrompt(teamId, gladSadMad.id, question, idx)
      )
      const fourLs = fourLsPrompts.map((question, idx) =>
        makePrompt(teamId, fourL.id, question, idx)
      )
      const starts = startStopContPrompts.map((question, idx) =>
        makePrompt(teamId, startStopCont.id, question, idx)
      )
      const sailboats = sailboatPrompts.map((question, idx) =>
        makePrompt(teamId, sail.id, question, idx)
      )
      phaseItemInserts.push(...glads, ...fourLs, ...starts, ...sailboats)
    })
    await r
      .table('CustomPhaseItem')
      .insert(phaseItemInserts)
      .run()
  } catch (e) { }
}

exports.down = async (r) => {
  try {
    await Promise.all([r.tableDrop('ReflectTemplate').run()])
  } catch (e) { }
  try {
    const retrosCreatedAtDate = new Date('02/12/2018')
    await r
      .table('CustomPhaseItem')
      .filter((row) => row('createdAt').ne(retrosCreatedAtDate))
      .delete()
      .run()
    await r
      .table('CustomPhaseItem')
      .replace((r) => r.row.without('createdAt', 'updatedAt', 'templateId'))
      .run()
  } catch (e) { }
}
