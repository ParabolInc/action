import catchAndLog from '../utils/catchAndLog'
import {insertUserQuery, IInsertUserQueryParams} from './generated/insertUserQuery'
import getPg from '../getPg'
import AuthIdentity from '../../database/types/AuthIdentity'

interface InsertUserQueryParams extends Omit<IInsertUserQueryParams, 'identities'> {
  identities: AuthIdentity[]
}

const insertUser = async (user: InsertUserQueryParams): Promise<void> => {
  await catchAndLog(() => insertUserQuery.run((user as unknown) as IInsertUserQueryParams, getPg()))
}

export default insertUser
