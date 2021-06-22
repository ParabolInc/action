/* DEPRECATED */
export default async function sendAssetToS3(asset, assetPutUrl) {
  if (!__CLIENT__) return undefined
  const res = await window.fetch(assetPutUrl, {
    method: 'PUT',
    body: asset
  })
  if (res.status < 200 || res.status >= 300) {
    const error = new Error(res.statusText)
    error.res = res
    throw error
  }
  const {url: putUrl} = res
  // crafty way of parsing URL, see: https://gist.github.com/jlong/2428561
  const parser = document.createElement('a')
  parser.href = putUrl
  const {protocol, host, pathname} = parser
  return `${protocol}//${host}${pathname}`
}
