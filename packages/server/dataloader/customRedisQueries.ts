// Sometimes, a value cached is redis is harder to get than simply querying the primary key on a table
// this allows redis to cache the results of arbitrarily complex rethinkdb queries

import ms from 'ms'
import getRethink from '../database/rethinkDriver'

const customRedisQueries = {
  endTimesByTemplateId: async (templateIds: string[]) => {
    const r = await getRethink()
    const aQuarterAgo = new Date(Date.now() - ms('90d'))
    const meetings = (await (r
      .table('NewMeeting')
      .getAll(r.args(templateIds), {index: 'templateId'})
      .pluck('templateId', 'endedAt')
      .filter((row) => row('endedAt').ge(aQuarterAgo))
      .group('templateId' as any) as any)
      .limit(1000)('endedAt')
      .run()) as {group: string; reduction: Date[]}[]
    return templateIds.map((id) => {
      const group = meetings.find((meeting) => meeting.group === id)
      return group ? group.reduction.map((date) => date.getTime()) : []
    })
  },
  publicTemplates: async (meetingTypes: string[]) => {
    const r = await getRethink()

    const publicTemplatesByType = await Promise.all(
      meetingTypes.map((type) => {
        const templateType = type === 'poker' ? 'poker' : 'retrospective'
        return r
          .table('MeetingTemplate')
          .filter({scope: 'PUBLIC', isActive: true, type: templateType})
          .limit(1000)
          .run()
      })
    )

    return publicTemplatesByType
  },
  starterScales: async (teamIds: string[]) => {
    const r = await getRethink()

    const starterScales = await Promise.all(
      teamIds.map((teamId) => {
        return r
          .table('TemplateScale')
          .getAll(teamId, {index: 'teamId'})
          .filter({isStarter: true})
          .filter((row) =>
            row('removedAt')
              .default(null)
              .eq(null)
          )
          .run()
      })
    )

    return starterScales
  }
} as const

export default customRedisQueries
