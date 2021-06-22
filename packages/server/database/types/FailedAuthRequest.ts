import generateUID from '../../generateUID'

interface Input {
  id?: string
  ip: string
  email: string
  time?: Date
}

export default class FailedAuthRequest {
  id: string
  ip: string
  email: string
  time: Date
  constructor(input: Input) {
    const {id, email, ip, time} = input
    this.id = id ?? generateUID()
    this.email = email
    this.ip = ip
    this.time = time ?? new Date()
  }
}
