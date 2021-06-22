import {toEpochSeconds} from '../../utils/epochTime'
import {Threshold} from 'parabol-client/types/constEnums'
import makeAppURL from '../../../client/utils/makeAppURL'
import appOrigin from '../../appOrigin'

interface Input {
  sub: string
  tms: string[]
  rol?: 'su'
  bet?: 1
}

export default class AuthToken {
  sub: string
  tms: string[]
  rol?: 'su'
  bet?: 1
  iat: number
  iss: string
  exp: number
  aud: string
  constructor(input: Input) {
    const {bet, rol, sub, tms} = input
    const now = new Date()
    this.sub = sub
    this.tms = tms
    this.iat = toEpochSeconds(now)
    this.aud = 'action'
    this.iss = makeAppURL(appOrigin, '/')
    this.exp = toEpochSeconds(now.getTime() + Threshold.JWT_LIFESPAN)

    if (bet) {
      this.bet = bet
    }
    if (rol) {
      this.rol = rol
    }
  }
}
