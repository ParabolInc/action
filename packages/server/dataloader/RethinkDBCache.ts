import getRethink, {DBType} from '../database/rethinkDriver'
import {RDatum} from '../database/stricterR'

export type Updater<T> = Partial<T> | ((doc: RDatum<T>) => any)
export interface RRead<T> {
  id: string
  table: T
}
export interface RWrite<T> extends RRead<T> {
  updater: Updater<T>
}

export default class RethinkDBCache {
  read = async <T extends keyof DBType>(fetches: RRead<T>[]) => {
    const r = await getRethink()
    const idsByTable = {} as {[table: string]: string[]}
    fetches.forEach((fetch) => {
      const {table, id} = fetch
      idsByTable[table] = idsByTable[table] || []
      idsByTable[table].push(id)
    })
    const reqlObj = {} as {[table: string]: DBType[T][]}
    Object.keys(idsByTable).forEach((table: string) => {
      const ids = idsByTable[table]
      reqlObj[table] = (r
        .table(table as any)
        .getAll(r.args(ids))
        .coerceTo('array') as unknown) as DBType[T][]
    })

    const dbDocsByTable = await r(reqlObj).run()
    const docsByKey = {} as {[key: string]: DBType[T]}
    Object.keys(dbDocsByTable).forEach((table) => {
      const docs = dbDocsByTable[table]
      docs.forEach((doc) => {
        const key = `${table}:${doc.id}`
        docsByKey[key] = doc
      })
    })
    return docsByKey
  }
  write = async <T extends keyof DBType>(writes: RWrite<T>[]) => {
    const r = await getRethink()
    const reqlParts = writes.map((update) => {
      const {table, id, updater} = update
      return (
        r
          .table(table)
          .get(id)
          // "always" will return the document whether it has changed or not
          .update(updater, {returnChanges: 'always'})('changes')(0)('new_val')
          .default(null)
      )
    })
    return r(reqlParts).run() as Promise<(DBType[T] | null)[]>
  }
  writeTable = async <T extends keyof DBType>(table: T, updater: Partial<DBType[T]>) => {
    const r = await getRethink()
    return r
      .table(table)
      .update(updater)
      .run()
  }
}
