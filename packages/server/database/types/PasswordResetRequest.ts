import generateUID from '../../generateUID'

interface Input {
  id?: string
  ip: string
  isValid?: boolean
  email: string
  token: string
  time?: Date
}

export default class PasswordResetRequest {
  id: string
  ip: string
  email: string
  time: Date
  token: string
  isValid: boolean
  constructor(input: Input) {
    const {id, email, ip, isValid, time, token} = input
    this.id = id ?? generateUID()
    this.email = email
    this.ip = ip
    this.time = time ?? new Date()
    this.token = token
    this.isValid = isValid ?? true
  }
}
