
exports.up = async (r) => {
  let counter = 256
  try {
    await r.tableCreate('OrganizationUser').run()
  } catch (e) {
    // noop
  }
  try {
    await r({
      userId: r
        .table('OrganizationUser')
        .indexCreate('userId')
        .run(),
      orgId: r
        .table('OrganizationUser')
        .indexCreate('orgId')
        .run()
    })
  } catch (e) { }
  try {
    const orgs = await r
      .table('Organization')
      .pluck('id', 'createdAt', 'orgUsers')
      .run()
    const organizationUsers = []
    orgs.forEach((org) => {
      org.orgUsers.forEach((orgUser) => {
        organizationUsers.push({
          id: String(counter++),
          inactive: orgUser.inactive || false,
          joinedAt: org.createdAt,
          newUserUntil: org.createdAt,
          orgId: org.id,
          removedAt: null,
          role: orgUser.role || null,
          userId: orgUser.id
        })
      })
    })
    await r({
      organizationUsers: r
        .table('OrganizationUser')
        .insert(organizationUsers)
        .run(),
      users: r
        .table('User')
        .replace(r.row.without('userOrgs'))
        .run(),
      orgs: r
        .table('Organization')
        .replace(r.row.without('orgUsers'))
        .run(),
      userIdx: r
        .table('User')
        .indexDrop('userOrgs')
        .run(),
      orgIdx: r
        .table('Organization')
        .indexDrop('orgUsers')
        .run()
    })
  } catch (e) { }
}

exports.down = async (r) => {
  try {
    await r.tableDrop('OrganizationUser').run()
    await r
      .table('User')
      .indexCreate('userOrgs')
      .run()
    await r
      .table('Organization')
      .indexCreate('orgUsers')
      .run()
  } catch (e) {
    // noop
  }
}
