import getRethink from '../database/rethinkDriver'
import Team from '../database/types/Team'
import db from '../db'
import {removeUserTmsQuery} from '../postgres/queries/generated/removeUserTmsQuery'
import getPg from '../postgres/getPg'
import catchAndLog from '../postgres/utils/catchAndLog'
import {
  IUpdateTeamByTeamIdQueryParams,
  updateTeamByTeamIdQuery
} from '../postgres/queries/generated/updateTeamByTeamIdQuery'

const safeArchiveTeam = async (teamId: string) => {
  const r = await getRethink()
  const now = new Date()
  const userIds = await r
    .table('TeamMember')
    .getAll(teamId, {index: 'teamId'})
    .filter({isNotRemoved: true})('userId')
    .run()
  const [users] = await Promise.all([
    db.writeMany('User', userIds, (user) => ({
      tms: user('tms').difference([teamId])
    })),
    catchAndLog(() => removeUserTmsQuery.run({ids: userIds, teamIds: [teamId]}, getPg()))
  ])
  const [rethinkResult] = await Promise.all([
    r({
      team: (r
        .table('Team')
        .get(teamId)
        .update(
          {isArchived: true},
          {returnChanges: true}
        )('changes')(0)('new_val')
        .default(null) as unknown) as Team | null,
      invitations: (r
        .table('TeamInvitation')
        .getAll(teamId, {index: 'teamId'})
        .filter({acceptedAt: null})
        .update((invitation) => ({
          expiresAt: r.min([invitation('expiresAt'), now])
        })) as unknown) as null,
      removedSuggestedActionIds: (r
        .table('SuggestedAction')
        .filter({teamId})
        .update(
          {
            removedAt: now
          },
          {returnChanges: true}
        )('changes')('new_val')('id')
        .default([]) as unknown) as string[]
    }).run(),
    catchAndLog(() =>
      updateTeamByTeamIdQuery.run(
        {
          isArchived: true,
          id: teamId
        } as IUpdateTeamByTeamIdQueryParams,
        getPg()
      )
    )
  ])
  return {...rethinkResult, users}
}

export default safeArchiveTeam
