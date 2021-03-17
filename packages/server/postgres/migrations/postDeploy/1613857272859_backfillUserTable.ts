/* eslint-disable @typescript-eslint/camelcase */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';
import getRethink from '../../../database/rethinkDriver'
import {backupUserQuery} from '../../queries/generated/backupUserQuery'
import catchAndLog from '../../utils/catchAndLog'
import getPg from '../../getPg'
import User from '../../../database/types/User'
import {IBackupUserQueryParams} from '../../queries/generated/backupUserQuery'
import getDeletedEmail from '../../../utils/getDeletedEmail'

const undefinedUserFieldsAndTheirDefaultPgValues = {
  newFeatureId: null,
  overLimitCopy: null,
  isRemoved: false,
  segmentId: null,
  reasonRemoved: null,
  rol: null,
  // app doesn't allow following fields to be undefined, but found bad data anyway
  inactive: false,
  payLaterClickCount: 0,
  featureFlags: [],
}

const cleanUsers = (users: User[]): IBackupUserQueryParams['users'] => {
  const cleanedUsers = [] as any
  users.forEach(user => {
    if (user.email.length > 500) {
      return // bad actors were messing up unique constraint
    } 
    const cleanedUser = Object.assign(
      {},
      undefinedUserFieldsAndTheirDefaultPgValues,
      user,
      {
        email: user.email === 'DELETED' ?
          getDeletedEmail(user.id) : user.email,
        preferredName: user.preferredName.slice(0, 100),
      }
    ) as IBackupUserQueryParams['users'][0]
    cleanedUsers.push(cleanedUser)
  })
  return cleanedUsers
}

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  const r = await getRethink()
  const batchSize = 3000 // doing 4000 or 5000 results in error relating to size of parameterized query
  const backfillStartTs = new Date()
  // todo: make `doBackfill` generic and reusable
  const doBackfill = async (
    usersByFieldChoice: ('createdAt' | 'updatedAt'),
    usersAfterTs?: Date
  ) => {
    let i = 0
    let foundUsers = false

    for (let i = 0; i < 1e5; i++) {
      console.log('i:', i)
      const offset = batchSize * i
      const rethinkUsers = await r.db('actionProduction')
        .table('User')
        .between(usersAfterTs ?? r.minval, r.maxval, {index: usersByFieldChoice})
        .orderBy(usersByFieldChoice, {index: usersByFieldChoice})
        .skip(offset)
        .limit(batchSize)
        .run()
      if (!rethinkUsers.length) { break }
      foundUsers = true
      const pgUsers = cleanUsers(rethinkUsers)
      await catchAndLog(() => backupUserQuery.run({users: pgUsers}, getPg()))
    }
    return foundUsers
  }
  // todo: make `doBackfillAccountingForRaceConditions` generic and reusable
  const doBackfillAccountingForRaceConditions = async (
    usersByFieldChoice: ('createdAt' | 'updatedAt'),
    usersAfterTs?: Date
  ) => {
    while (true) {
      const thisBackfillStartTs = new Date()
      const backfillFoundUsers = await doBackfill(
        usersByFieldChoice,
        usersAfterTs
      )
      // await new Promise(resolve => setTimeout(resolve, 1000*60*2)) // update user while sleeping
      if (!backfillFoundUsers) { break }
      usersAfterTs = thisBackfillStartTs
    }
  }

  await doBackfillAccountingForRaceConditions('createdAt')
  await doBackfillAccountingForRaceConditions('updatedAt', backfillStartTs)
  await r.getPoolMaster().drain()
  console.log('finished')
}
