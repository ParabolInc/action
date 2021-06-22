import {ColumnDefinitions, MigrationBuilder} from 'node-pg-migrate'
import getRethink from '../../../database/rethinkDriver'
import User from '../../../database/types/User'
import getDeletedEmail from '../../../utils/getDeletedEmail'
import getPg from '../../getPg'
import {backupUserQuery, IBackupUserQueryParams} from '../../queries/generated/backupUserQuery'
import catchAndLog from '../../utils/catchAndLog'

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
  featureFlags: []
}

const cleanUsers = (users: User[]): IBackupUserQueryParams['users'] => {
  const cleanedUsers = [] as any
  users.forEach((user) => {
    if (user.email.length > 500) {
      return // bad actors were messing up unique constraint
    }
    const cleanedUser = Object.assign({}, undefinedUserFieldsAndTheirDefaultPgValues, user, {
      email: user.email === 'DELETED' ? getDeletedEmail(user.id) : user.email,
      preferredName: user.preferredName.slice(0, 100)
    }) as IBackupUserQueryParams['users'][0]
    cleanedUsers.push(cleanedUser)
  })
  return cleanedUsers
}

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  const r = await getRethink()
  const batchSize = 3000 // doing 4000 or 5000 results in error relating to size of parameterized query
  // todo: make `doBackfill` generic and reusable
  const doBackfill = async (usersAfterTs?: Date) => {
    const i = 0
    let foundUsers = false

    for (let i = 0; i < 1e5; i++) {
      console.log('i:', i)
      const offset = batchSize * i
      const rethinkUsers = await r
        .table('User')
        .between(usersAfterTs ?? r.minval, r.maxval, {index: 'updatedAt'})
        .orderBy('updatedAt', {index: 'updatedAt'})
        .skip(offset)
        .limit(batchSize)
        .run()
      if (!rethinkUsers.length) {
        break
      }
      foundUsers = true
      const pgUsers = cleanUsers(rethinkUsers)
      await catchAndLog(() => backupUserQuery.run({users: pgUsers}, getPg()))
    }
    return foundUsers
  }
  // todo: make `doBackfillAccountingForRaceConditions` generic and reusable
  const doBackfillAccountingForRaceConditions = async (usersAfterTs?: Date) => {
    for (let i = 0; i < 1e5; i++) {
      const thisBackfillStartTs = new Date()
      const backfillFoundUsers = await doBackfill(usersAfterTs)
      // await new Promise(resolve => setTimeout(resolve, 1000*60*2)) // update user while sleeping
      if (!backfillFoundUsers) {
        break
      }
      usersAfterTs = thisBackfillStartTs
    }
  }

  await doBackfillAccountingForRaceConditions()
  console.log('finished')
}
