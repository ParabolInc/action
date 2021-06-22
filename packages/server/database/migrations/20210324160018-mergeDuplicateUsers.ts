import {R} from 'rethinkdb-ts'
import User from '../types/User'

export const up = async function(r: R) {
  // fix the first user (duplicated later) having a string for `tms` field
  await r
    .table('User')
    .getAll('love@parabol.co', {index: 'email'})
    .orderBy('createdAt')
    .limit(1)
    .update((row) => ({tms: [row('tms')]}))
    .run()

  const updateTeamMember = async (goodUserId: string, badUserId: string) => {
    // we don't want to delete the team member because the NewMeeting object
    // references it in the TeamMemberStages (checkin & update stages)
    // instead, we just inactivate
    const {goodTeamMembers, badTeamMembers} = await r({
      goodTeamMembers: r
        .table('TeamMember')
        .getAll(goodUserId, {index: 'userId'})
        .coerceTo('array') as any,
      badTeamMembers: r
        .table('TeamMember')
        .getAll(badUserId, {index: 'userId'})
        .update(
          {
            userId: goodUserId,
            isNotRemoved: false
          },
          {returnChanges: true}
        )('changes')('new_val')
        .default([]) as any
    }).run()

    // for each bad team member, see if a good one exists on that team
    // if the good one does not exist, then create it since the old in now inactive
    const teamMembersToInsert = [] as any[]
    badTeamMembers.forEach((badTeamMember) => {
      const goodTeamMember = goodTeamMembers.find(
        (teamMember) => teamMember.id === badTeamMember.id
      )
      if (!goodTeamMember) {
        badTeamMember.id = `${goodUserId}::${badTeamMember.teamId}`
        teamMembersToInsert.push(badTeamMember)
      }
    })
    await r
      .table('TeamMember')
      .insert(badTeamMembers)
      .run()
    // update org user
    // it's possible 2 user objects could exist on the same, that's OK for now
    await r
      .table('OrganizationUser')
      .getAll(badUserId, {index: 'userId'})
      .update({
        userId: goodUserId
      })
      .run()

    // replace meeting members with updated ones
    const meetingMembers = await r
      .table('MeetingMember')
      .getAll(badUserId, {index: 'userId'})
      .run()
    const updatedMeetingMembers = meetingMembers.map((meetingMember) => ({
      ...meetingMember,
      id: `${goodUserId}::${meetingMember.meetingId}`,
      userId: goodUserId
    }))
    await r
      .table('MeetingMember')
      .getAll(badUserId, {index: 'userId'})
      .delete()
      .run()
    await r
      .table('MeetingMember')
      .insert(updatedMeetingMembers)
      .run()

    // replace team invitations
    await r
      .table('TeamInvitation')
      .filter({invitedBy: badUserId})
      .update({invitedBy: goodUserId})
      .run()
    await r
      .table('Notification')
      .filter({
        evictorUserId: badUserId
      })
      .update({
        evictorUserId: goodUserId
      })
      .run()
    await r
      .table('Notification')
      .filter({
        archivorUserId: badUserId
      })
      .update({
        archivorUserId: goodUserId
      })
      .run()
  }

  try {
    /*const affectedEmails = (await r
      .table('User')
      .group('email')
      .count()
      .ungroup()
      .filter((row) => row('reduction').gt(1))('group')
      .filter((row) => row.ne('DELETED'))
      .run({arrayLimit: 200000})) as string[]*/

    // put emails in db to keep PII secret
    const affectedEmails = await r
      .table('DuplicateEmails')
      .getField('email')
      .coerceTo('array')
      .run()

    const allDuplicates = [] as Promise<User[]>[]
    affectedEmails.forEach((email) => {
      allDuplicates.push(
        r
          .table('User')
          .getAll(email, {index: 'email'})
          .orderBy('createdAt')
          .coerceTo('array')
          .run()
      )
    })

    const toUpdate = [] as User[]
    const toDeleteIds = [] as string[]
    const teamMemberUpdates = [] as Promise<void>[]
    for await (const innerArr of allDuplicates) {
      const [old, ...newer] = innerArr
      const {identities: oldIdentities} = old
      for (const dup of newer) {
        const {identities} = dup
        for (const identity of identities) {
          const {type} = identity
          const matchingOldIdentityIdx = oldIdentities.findIndex(
            (identity) => identity.type === type
          )
          if (matchingOldIdentityIdx !== -1) {
            oldIdentities[matchingOldIdentityIdx] = identity
          }
        }
        old.tms = old.tms.concat(dup.tms)
        old.email = dup.email ? dup.email : old.email
        old.picture = dup.picture ? dup.picture : old.picture
        toDeleteIds.push(dup.id)
        teamMemberUpdates.push(updateTeamMember(old.id, dup.id))
      }
      old.tms = Array.from(new Set(old.tms))
      toUpdate.push(old)
    }

    await r(toUpdate)
      .forEach((update) => {
        return r
          .table('User')
          .get(update('id'))
          .update({
            email: update('email'),
            picture: update('picture'),
            tms: update('tms'),
            identities: update('identities')
          })
      })
      .run()

    await r
      .table('User')
      .getAll(r.args(toDeleteIds))
      .delete()
      .run()
  } catch (e) {
    // console.log(e)
  }
}

export const down = async () => {
  // noop
}
