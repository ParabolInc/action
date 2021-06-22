export type TAuthIdentity = 'GOOGLE' | 'LOCAL'

interface Input {
  id: string
  isEmailVerified?: boolean
  type: TAuthIdentity
}

export default abstract class AuthIdentity {
  isEmailVerified: boolean
  type: TAuthIdentity
  id: string
  constructor(input: Input) {
    const {id, isEmailVerified, type} = input
    this.isEmailVerified = isEmailVerified ?? false
    this.type = type
    this.id = id
  }
}
