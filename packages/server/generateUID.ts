const MID = BigInt(process.env.SERVER_ID)
const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
const len = BigInt(ALPHABET.length)
const EPOCH = Date.UTC(2021, 0, 1)
// timestamp is 40 bits (good until 2033)
const MACHINE_ID_BIT_LEN = 10
const SEQ_BIT_LEN = 12
const TS_OFFSET = BigInt(MACHINE_ID_BIT_LEN + SEQ_BIT_LEN)
const MID_OFFSET = BigInt(SEQ_BIT_LEN)
const BIG_ZERO = BigInt(0)
const MAX_SEQ = 2 ** SEQ_BIT_LEN - 1

let seq = 0
let lastTime = Date.now()
const generateUID = () => {
  let now = Date.now()
  if (now < lastTime) {
    now = lastTime
  }
  if (now === lastTime) {
    seq++
    if (seq > MAX_SEQ) {
      seq = 0
      now++
    }
  } else {
    seq = 0
  }
  lastTime = now
  const ts = BigInt(now - EPOCH)
  const decimalId = (ts << TS_OFFSET) | (MID << MID_OFFSET) | BigInt(seq)

  let id = ''
  let residual = decimalId
  while (true) {
    const rixit = Number(residual % len)
    id = ALPHABET.charAt(rixit) + id
    residual = ~~(residual / len)
    if (residual === BIG_ZERO) {
      return id
    }
  }
}

export default generateUID
