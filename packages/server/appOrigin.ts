const proto = process.env.PROTO
const host = process.env.HOST
const port = process.env.PORT
const portSuffix = host !== 'localhost' ? '' : `:${port}`
const appOrigin = `${proto}://${host}${portSuffix}`
export default appOrigin
