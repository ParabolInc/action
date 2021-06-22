import {AuthIdentityTypeEnum} from '../../client/types/constEnums'
import AuthIdentityLocal from '../database/types/AuthIdentityLocal'
import User from '../database/types/User'

interface Props {
  email: string
  hashedPassword: string
  segmentId?: string | null
  isEmailVerified: boolean
}

const createNewLocalUser = (props: Props) => {
  const {email, hashedPassword, segmentId, isEmailVerified} = props
  const [nickname] = email.split('@')
  const preferredName = nickname.length === 1 ? nickname.repeat(2) : nickname
  const newUser = new User({
    preferredName,
    email,
    identities: [],
    segmentId
  })
  const {id: userId} = newUser
  const identityId = `${userId}:${AuthIdentityTypeEnum.LOCAL}`
  newUser.identities.push(new AuthIdentityLocal({hashedPassword, id: identityId, isEmailVerified}))
  return newUser
}

export default createNewLocalUser
