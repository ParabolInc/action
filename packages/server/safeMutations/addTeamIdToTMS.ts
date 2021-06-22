import getPg from '../postgres/getPg'
import getRethink from '../database/rethinkDriver'
import db from '../db'
import {appendUserTmsQuery} from '../postgres/queries/generated/appendUserTmsQuery'
import catchAndLog from '../postgres/utils/catchAndLog'

const addTeamIdToTMS = async (userId, teamId) => {
  const r = await getRethink()
  return Promise.all([
    catchAndLog(() => appendUserTmsQuery.run({id: userId, teamId}, getPg())),
    db.write('User', userId, (user) => ({
      tms: r.branch(
        user('tms')
          .contains(teamId)
          .default(false),
        user('tms'),
        user('tms')
          .default([])
          .append(teamId)
      )
    }))
  ])
}

export default addTeamIdToTMS
