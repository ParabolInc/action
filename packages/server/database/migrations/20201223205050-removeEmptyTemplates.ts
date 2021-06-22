import {R} from 'rethinkdb-ts'
export const up = async function (r: R) {
  const now = new Date()
  try {
    const promptlessTemplateIds = await r
      .table('MeetingTemplate')
      .filter({type: 'retrospective'})
      .merge((template) => ({
        promptCount: r
          .table('ReflectPrompt')
          .getAll(template('id'), {index: 'templateId'})
          .filter((row) => row('removedAt').default(null).eq(null))
          .count()
          .default(0)
      }))
      .filter((template) => template('promptCount').eq(0))
      .map((row) => row('id'))
      .coerceTo('array')
      .run()

    await r
      .table('MeetingTemplate')
      .getAll(r.args(promptlessTemplateIds))
      .filter({isActive: true})
      .update({isActive: false})
      .run()

    await r
      .table('NewMeeting')
      .getAll(r.args(promptlessTemplateIds), {index: 'templateId'})
      .filter((meeting) => meeting.hasFields('endedAt').not())
      .update({endedAt: now, removedAt: now})
      .run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function (r: R) {
  // noop
}
