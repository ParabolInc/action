
// This deprecates the SlackIntegration table as well as all slack rows in the Provider table
exports.up = async (r) => {
  let counter = 555
  try {
    await Promise.all([r.tableCreate('SlackAuth').run(), r.tableCreate('SlackNotification').run()])
  } catch (e) {
    /**/
  }
  try {
    await Promise.all([
      r
        .table('SlackAuth')
        .indexCreate('userId')
        .run(),
      r
        .table('SlackAuth')
        .indexCreate('teamId')
        .run(),
      r
        .table('SlackNotification')
        .indexCreate('userId')
        .run(),
      r
        .table('SlackNotification')
        .indexCreate('teamId')
        .run()
    ])
  } catch (e) {
    /**/
  }
  const slackProviders = await r
    .table('Provider')
    .filter({isActive: true, service: 'SlackIntegration'})
    .run()
  const slackAuths = slackProviders.map((provider) => ({
    id: provider.id,
    isActive: true,
    createdAt: provider.createdAt,
    updatedAt: provider.updatedAt,
    teamId: provider.teamId,
    userId: provider.userId,
    accessToken: provider.accessToken,
    slackTeamId: provider.teamId,
    // we can retroactively grab this later, after they re-up with a new scope
    // slackTeamName,
    slackUserId: provider.providerUserId,
    slackUserName: provider.providerUserName
  }))
  try {
    await r
      .table('SlackAuth')
      .insert(slackAuths)
      .run()
  } catch (e) {
    console.log(e)
  }

  const slackIntegrations = await r
    .table('SlackIntegration')
    .filter({isActive: true})
    .run()
  const slackNotifications = []
  slackIntegrations.forEach((integration) => {
    const slackAuth = slackAuths.find((auth) => auth.teamId === integration.teamId)
    if (!slackAuth) return
    const notifications = ['meetingStart', 'meetingEnd'].map((event) => ({
      id: String(counter++),
      channelId: integration.isActive ? integration.channelId : null,
      channelName: integration.channelName,
      teamId: integration.teamId,
      userId: slackAuth.userId,
      event
    }))
    slackNotifications.push(...notifications)
  })
  try {
    await r
      .table('SlackNotification')
      .insert(slackNotifications)
      .run()
  } catch (e) {
    console.log(e)
  }
}

exports.down = async (r) => {
  try {
    await Promise.all([r.tableDrop('SlackAuth').run(), r.tableDrop('SlackNotification').run()])
  } catch (e) {
    /**/
  }
}
