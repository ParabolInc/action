// import signPayload from './signPayload'

// const makeGitHubWebhookParams = (publickKey, events) => ({
//   name: 'web',
//   config: {
//     // url: makeAppLink('webhooks/github', {isWebhook: true}),
//     content_type: 'json',
//     // this doesn't have to be the client secret, but i don't see much harm in reusing it, assuming it's all SSL
//     secret: signPayload(process.env.GITHUB_WEBHOOK_SECRET, publickKey),
//     insecure_ssl: 0
//   },
//   events,
//   active: true
// })

// export default makeGitHubWebhookParams
