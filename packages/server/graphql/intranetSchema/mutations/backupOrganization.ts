import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLString} from 'graphql'
import getRethink from '../../../database/rethinkDriver'
import {requireSU} from '../../../utils/authorization'
import {GQLContext} from '../../graphql'

const backupOrganization = {
  type: GraphQLNonNull(GraphQLString),
  description: 'copies all the records from RethinkDB for a list of organizations',
  args: {
    orgIds: {
      type: GraphQLNonNull(GraphQLList(GraphQLNonNull(GraphQLID)))
    }
  },
  resolve: async (_source, {orgIds}, {authToken}: GQLContext) => {
    // AUTH
    requireSU(authToken)

    // RESOLUTION
    const r = await getRethink()
    const DESTINATION = 'orgBackup'

    // create the DB
    try {
      await r.dbDrop(DESTINATION).run()
    } catch (e) {
      // db never existed. all good
    }
    await r.dbCreate(DESTINATION).run()
    // create all the tables
    await (r.tableList() as any)
      .forEach((table) => {
        return r.db(DESTINATION).tableCreate(table)
      })
      .run()

    // now create all the indexes
    await (r.tableList() as any)
      .forEach((table) => {
        return r
          .table(table)
          .indexStatus()
          .forEach((idx) => {
            return r
              .db(DESTINATION)
              .table(table)
              .indexCreate(idx('index'), idx('function'), {
                geo: (idx('geo') as any) as boolean,
                multi: (idx('multi') as any) as boolean
              })
          })
      })
      .run()

    // get all the teams for the orgIds
    const team = await r
      .table('Team')
      .getAll(r.args(orgIds), {index: 'orgId'})
      .run()
    const teamIds = team.map((team) => team.id)
    await r({
      // easy things to clone
      migrations: r
        .table('_migrations' as any)
        .coerceTo('array')
        .do((items) =>
          r
            .db(DESTINATION)
            .table('_migrations' as any)
            .insert(items)
        ),
      agendaItem: (r.table('AgendaItem').getAll(r.args(teamIds), {index: 'teamId'}) as any)
        .coerceTo('array')
        .do((items) =>
          r
            .db(DESTINATION)
            .table('AgendaItem')
            .insert(items)
        ),
      atlassianAuth: (r.table('AtlassianAuth').getAll(r.args(teamIds), {index: 'teamId'}) as any)
        .coerceTo('array')
        .do((items) =>
          r
            .db(DESTINATION)
            .table('AtlassianAuth')
            .insert(items)
        ),
      invoice: (r.table('Invoice').filter((row) => r(orgIds).contains(row('orgId'))) as any)
        .coerceTo('array')
        .do((items) =>
          r
            .db(DESTINATION)
            .table('Invoice')
            .insert(items)
        ),
      invoiceItemHook: (r
        .table('InvoiceItemHook')
        .filter((row) => r(orgIds).contains(row('orgId'))) as any)
        .coerceTo('array')
        .do((items) =>
          r
            .db(DESTINATION)
            .table('InvoiceItemHook')
            .insert(items)
        ),
      meetingMember: (r.table('MeetingMember').getAll(r.args(teamIds), {index: 'teamId'}) as any)
        .coerceTo('array')
        .do((items) =>
          r
            .db(DESTINATION)
            .table('MeetingMember')
            .insert(items)
        ),
      meetingSettings: (r
        .table('MeetingSettings')
        .getAll(r.args(teamIds), {index: 'teamId'}) as any)
        .coerceTo('array')
        .do((items) =>
          r
            .db(DESTINATION)
            .table('MeetingSettings')
            .insert(items)
        ),
      newMeeting: (r.table('NewMeeting').getAll(r.args(teamIds), {index: 'teamId'}) as any)
        .coerceTo('array')
        .do((items) =>
          r
            .db(DESTINATION)
            .table('NewMeeting')
            .insert(items)
        ),
      organization: (r.table('Organization').getAll(r.args(orgIds)) as any)
        .coerceTo('array')
        .do((items) =>
          r
            .db(DESTINATION)
            .table('Organization')
            .insert(items)
        ),
      organizationUser: (r
        .table('OrganizationUser')
        .getAll(r.args(orgIds), {index: 'orgId'}) as any)
        .coerceTo('array')
        .do((items) =>
          r
            .db(DESTINATION)
            .table('OrganizationUser')
            .insert(items)
        ),
      reflectPrompt: (r.table('ReflectPrompt').getAll(r.args(teamIds), {index: 'teamId'}) as any)
        .coerceTo('array')
        .do((items) =>
          r
            .db(DESTINATION)
            .table('ReflectPrompt')
            .insert(items)
        ),
      meetingTemplate: (r
        .table('MeetingTemplate')
        .getAll(r.args(teamIds), {index: 'teamId'}) as any)
        .coerceTo('array')
        .do((items) =>
          r
            .db(DESTINATION)
            .table('MeetingTemplate')
            .insert(items)
        ),
      templateDimension: (r
        .table('TemplateDimension')
        .filter((row) => r(teamIds).contains(row('teamId'))) as any)
        .coerceTo('array')
        .do((items) =>
          r
            .db(DESTINATION)
            .table('TemplateDimension')
            .insert(items)
        ),
      templateScale: (r
        .table('TemplateScale')
        .filter((row) => r(teamIds).contains(row('teamId'))) as any)
        .coerceTo('array')
        .do((items) =>
          r
            .db(DESTINATION)
            .table('TemplateScale')
            .insert(items)
        ),
      slackAuth: (r.table('SlackAuth').getAll(r.args(teamIds), {index: 'teamId'}) as any)
        .coerceTo('array')
        .do((items) =>
          r
            .db(DESTINATION)
            .table('SlackAuth')
            .insert(items)
        ),
      slackNotification: (r
        .table('SlackNotification')
        .getAll(r.args(teamIds), {index: 'teamId'}) as any)
        .coerceTo('array')
        .do((items) =>
          r
            .db(DESTINATION)
            .table('SlackNotification')
            .insert(items)
        ),
      task: (r.table('Task').getAll(r.args(teamIds), {index: 'teamId'}) as any)
        .coerceTo('array')
        .do((items) =>
          r
            .db(DESTINATION)
            .table('Task')
            .insert(items)
        ),
      team: r
        .db(DESTINATION)
        .table('Team')
        .insert(team),
      teamInvitation: (r.table('TeamInvitation').getAll(r.args(teamIds), {index: 'teamId'}) as any)
        .coerceTo('array')
        .do((items) =>
          r
            .db(DESTINATION)
            .table('TeamInvitation')
            .insert(items)
        ),
      teamMember: (r.table('TeamMember').getAll(r.args(teamIds), {index: 'teamId'}) as any)
        .coerceTo('array')
        .do((items) =>
          r
            .db(DESTINATION)
            .table('TeamMember')
            .insert(items)
        ),
      // hard things to clone
      userIds: r
        .table('TeamMember')
        .getAll(r.args(teamIds), {index: 'teamId'})('userId')
        .coerceTo('array')
        .do((userIds) => {
          return r({
            notification: (r
              .table('Notification')
              .getAll(r.args(userIds), {index: 'userId'}) as any)
              .filter((notification) =>
                r.branch(
                  notification('teamId')
                    .default(null)
                    .ne(null),
                  r.args(teamIds).contains(notification('teamId')),
                  notification('orgId')
                    .default(null)
                    .ne(null),
                  r.args(orgIds).contains(notification('orgId')),
                  true
                )
              )
              .coerceTo('array')
              .do((items) =>
                r
                  .db(DESTINATION)
                  .table('Notification')
                  .insert(items)
              ),
            suggestedAction: (r
              .table('SuggestedAction')
              .getAll(r.args(userIds), {index: 'userId'}) as any)
              .filter((row) =>
                r.or(
                  row('teamId')
                    .default(null)
                    .eq(null),
                  r(teamIds).contains(row('teamId'))
                )
              )
              .coerceTo('array')
              .do((items) =>
                r
                  .db(DESTINATION)
                  .table('SuggestedAction')
                  .insert(items)
              ),
            timelineEvent: (r
              .table('TimelineEvent')
              .filter((row) => r(userIds).contains(row('userId'))) as any)
              .filter((row) => r.branch(row('teamId'), r(teamIds).contains(row('teamId')), true))
              .coerceTo('array')
              .do((items) =>
                r
                  .db(DESTINATION)
                  .table('TimelineEvent')
                  .insert(items)
              ),
            user: (r.table('User').getAll(r.args(userIds)) as any).coerceTo('array').do((items) =>
              r
                .db(DESTINATION)
                .table('User')
                .insert(items)
            )
          })
        }),
      activeDomains: r
        .table('Organization')
        .getAll(r.args(orgIds))('activeDomain')
        .coerceTo('array')
        .do((domains) => {
          return r({
            SAML: (r.table('SAML').getAll(r.args(domains), {index: 'domains'}) as any)
              .coerceTo('array')
              .do((items) =>
                r
                  .db(DESTINATION)
                  .table('SAML')
                  .insert(items)
              ),
            secureDomain: (r
              .table('SecureDomain')
              .getAll(r.args(domains), {index: 'domain'}) as any)
              .coerceTo('array')
              .do((items) =>
                r
                  .db(DESTINATION)
                  .table('SecureDomain')
                  .insert(items)
              )
          })
        }),
      meetingIds: r
        .table('NewMeeting')
        .getAll(r.args(teamIds), {index: 'teamId'})('id')
        .coerceTo('array')
        .do((meetingIds) => {
          return r({
            retroReflection: (r
              .table('RetroReflection')
              .getAll(r.args(meetingIds), {index: 'meetingId'}) as any)
              .coerceTo('array')
              .do((items) =>
                r
                  .db(DESTINATION)
                  .table('RetroReflection')
                  .insert(items)
              ),
            retroReflectionGroup: (r
              .table('RetroReflectionGroup')
              .getAll(r.args(meetingIds), {index: 'meetingId'}) as any)
              .coerceTo('array')
              .do((items) =>
                r
                  .db(DESTINATION)
                  .table('RetroReflectionGroup')
                  .insert(items)
              ),
            // really hard things to clone
            reflectionGroupComments: r
              .table('RetroReflectionGroup')
              .getAll(r.args(meetingIds), {index: 'meetingId'})('id')
              .coerceTo('array')
              .do((threadIds) => {
                return (r.table('Comment').getAll(r.args(threadIds), {index: 'threadId'}) as any)
                  .coerceTo('array')
                  .do((items) =>
                    r
                      .db(DESTINATION)
                      .table('Comment')
                      .insert(items)
                  )
              }),
            agendaItemComments: r
              .table('AgendaItem')
              .getAll(r.args(meetingIds), {index: 'meetingId'})('id')
              .coerceTo('array')
              .do((threadIds) => {
                return (r.table('Comment').getAll(r.args(threadIds), {index: 'threadId'}) as any)
                  .coerceTo('array')
                  .do((items) =>
                    r
                      .db(DESTINATION)
                      .table('Comment')
                      .insert(items)
                  )
              })
          })
        })
    }).run()

    // remove teamIds that are not part of the desired orgIds
    await r
      .db('orgBackup')
      .table('User')
      .update((row) => ({
        tms: row('tms')
          .innerJoin(r(teamIds), (a, b) => a.eq(b))
          .zip()
      }))
      .run()

    return `Success! 'orgBackup' contains all the records for ${orgIds.join(', ')}`
  }
}
export default backupOrganization
