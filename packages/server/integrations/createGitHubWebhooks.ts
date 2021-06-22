// // import makeGitHubWebhookParams from '../utils/makeGitHubWebhookParams'
// import {GITHUB_ENDPOINT} from 'parabol-client/utils/constants'
// import makeGitHubPostOptions from 'parabol-client/utils/makeGitHubPostOptions'
// import fetch from 'node-fetch'

// export const createRepoWebhook = async (accessToken, nameWithOwner, publicKey) => {
//   const endpoint = `https://api.github.com/repos/${nameWithOwner}/hooks`
//   const res = await fetch(endpoint, {
//     headers: {Authorization: `Bearer ${accessToken}`}
//   })
//   const webhooks = await res.json()
//   // no need for an extra call to repositoryOwner to find out if its an org because personal or no access is handled the same
//   if (Array.isArray(webhooks) && webhooks.length === 0) {
//     // const createHookParams = makeGitHubWebhookParams(publicKey, [
//     //   'issues',
//     //   'issue_comment',
//     //   'label',
//     //   'member',
//     //   'milestone',
//     //   'pull_request',
//     //   'pull_request_review',
//     //   'repository'
//     // ])
//     fetch(endpoint, makeGitHubPostOptions(accessToken, createHookParams))
//   }
// }

// const getOrgQuery = `
// query getOrg($login: String!) {
//   organization(login: $login) {
//     databaseId
//   }
// }`

// export const createOrgWebhook = async (accessToken, nameWithOwner) => {
//   const [owner] = nameWithOwner.split('/')
//   const endpoint = `https://api.github.com/orgs/${owner}/hooks`
//   const res = await fetch(endpoint, {
//     headers: {Authorization: `Bearer ${accessToken}`}
//   })
//   const webhooks = await res.json()
//   // no need for an extra call to repositoryOwner to find out if its an org because personal or no access is handled the same
//   if (Array.isArray(webhooks) && webhooks.length === 0) {
//     const authedPostOptions = makeGitHubPostOptions(accessToken, {
//       query: getOrgQuery,
//       variables: {login: owner}
//     })
//     const ghProfile = await fetch(GITHUB_ENDPOINT, authedPostOptions)
//     const profileRes = await ghProfile.json()
//     if (profileRes.errors) {
//       throw profileRes.errors
//     }
//     const {
//       data: {
//         organization: {databaseId}
//       }
//     } = profileRes
//     const publicKey = String(databaseId)
//     console.log(publicKey)
//     // const createHookParams = makeGitHubWebhookParams(publickKey, ['organization'])
//     // fetch(endpoint, makeGitHubPostOptions(accessToken, createHookParams))
//   }
// }
