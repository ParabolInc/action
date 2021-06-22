import {ColumnDefinitions, MigrationBuilder} from 'node-pg-migrate'
import {MeetingTypeEnum} from 'parabol-client/types/graphql'
import getRethink from '../../../database/rethinkDriver'
import Team from '../../../database/types/Team'
import getPg from '../../getPg'
import {backupTeamQuery, IBackupTeamQueryParams} from '../../queries/generated/backupTeamQuery'
import catchAndLog from '../../utils/catchAndLog'

const undefinedTeamFieldsAndTheirDefaultValues = {
  jiraDimensionFields: [],
  isOnboardTeam: false
}

const cleanTeams = (teams: Team[]): IBackupTeamQueryParams['teams'] => {
  const cleanedTeams = []
  teams.forEach((team) => {
    const cleanedTeam = Object.assign({}, undefinedTeamFieldsAndTheirDefaultValues, team, {
      lastMeetingType: team.lastMeetingType ?? MeetingTypeEnum.retrospective,
      updatedAt: team.updatedAt ?? new Date(),
      jiraDimensionFields: team.jiraDimensionFields ?? [],
      name: team.name.slice(0, 100)
    })
    cleanedTeams.push(cleanedTeam)
  })
  return cleanedTeams as IBackupTeamQueryParams['teams']
}

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  const r = await getRethink()
  const batchSize = 3000 // doing 4000 or 5000 results in error relating to size of parameterized query
  // todo: make `doBackfill` generic and reusable
  const doBackfill = async (teamsAfterTs?: Date) => {
    let i = 0
    let foundTeams = false

    while (true) {
      console.log('i:', i)
      const offset = batchSize * i
      const rethinkTeams = await r
        .table('Team')
        .between(teamsAfterTs ?? r.minval, r.maxval, {index: 'updatedAt'})
        .orderBy('updatedAt', {index: 'updatedAt'})
        .skip(offset)
        .limit(batchSize)
        .run()
      if (!rethinkTeams.length) {
        break
      }
      foundTeams = true
      const pgTeams = cleanTeams(rethinkTeams)
      await catchAndLog(() => backupTeamQuery.run({teams: pgTeams}, getPg()))
      i += 1
    }
    return foundTeams
  }
  // todo: make `doBackfillAccountingForRaceConditions` generic and reusable
  const doBackfillAccountingForRaceConditions = async (teamsAfterTs?: Date) => {
    while (true) {
      const thisBackfillStartTs = new Date()
      const backfillFoundTeams = await doBackfill(teamsAfterTs)
      // await new Promise(resolve => setTimeout(resolve, 1000*60*2)) // update team while sleeping
      if (!backfillFoundTeams) {
        break
      }
      teamsAfterTs = thisBackfillStartTs
    }
  }

  await doBackfillAccountingForRaceConditions()
  console.log('finished')
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  // noop
}
