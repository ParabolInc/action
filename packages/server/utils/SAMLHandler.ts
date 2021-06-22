import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import uWSAsyncHandler from '../graphql/uWSAsyncHandler'
import parseBody from '../parseBody'
import publishWebhookGQL from './publishWebhookGQL'

const query = `
mutation LoginSAML($queryString: String!, $samlName: ID!) {
  loginSAML(queryString: $queryString, samlName: $samlName) {
    error {
      message
    }
    authToken
  }
}
`

const redirectOnError = (res: HttpResponse, error: string) => {
  res.writeStatus('302').writeHeader('location', `/saml-redirect?error=${error}`).end()
}

const GENERIC_ERROR = 'Error signing in|Please try again'

const SAMLHandler = uWSAsyncHandler(async (res: HttpResponse, req: HttpRequest) => {
  const samlName = req.getParameter(0)
  if (!samlName) {
    redirectOnError(res, 'Invalid redirect URL!|Did you set up the service provider correctly?')
    return
  }
  const parser = (buffer: Buffer) => buffer.toString()
  const queryString = await parseBody({res, parser})
  const payload = await publishWebhookGQL(query, {samlName, queryString})
  if (!payload) return
  const {data, errors} = payload
  if (!data || errors) {
    redirectOnError(res, GENERIC_ERROR)
    return
  }
  const {loginSAML} = data
  const {error, authToken} = loginSAML
  if (!authToken) {
    const message = error?.message || GENERIC_ERROR
    redirectOnError(res, message)
    return
  }
  res.cork(() => {
    res.writeStatus('302').writeHeader('location', `/saml-redirect?token=${authToken}`).end()
  })
})

export default SAMLHandler
