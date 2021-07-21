import cheerio from 'cheerio'
import crypto from 'crypto'
import fetch from 'node-fetch'
import ms from 'ms'
import getRedis from '../getRedis'

export const NO_IMAGE_BUFFER = Buffer.from('X')
export const IMAGE_TTL_MS = ms('2h')

const serverSecret = process.env.SERVER_SECRET
if (!serverSecret) {
  throw new Error('Missing SERVER_SECRET environment variable!')
}

/**
 * Parses a JIRA issue description and replaces the image urls with Parabol's image urls
 * @param {string} descriptionHTML - HTML string of related Jira issue description
 * @returns {UpdateJiraImagesResult} - Map of orginal image urls to hashed image urls and updated description
 */
export const updateJiraImageUrls = (cloudId: string, descriptionHTML: string) => {
  const imageUrlToHash = {} as Record<string, string>
  const projectBaseUrl = `https://api.atlassian.com/ex/jira/${cloudId}`

  const $ = cheerio.load(descriptionHTML)
  $('body')
    .find('img')
    .each((_i, img) => {
      const imageUrl = $(img).attr('src')
      if (!imageUrl) return

      const absoluteImageUrl = `${projectBaseUrl}${imageUrl}`
      const hashedImageUrl = createImageUrlHash(absoluteImageUrl)
      imageUrlToHash[absoluteImageUrl] = hashedImageUrl

      $(img).attr('src', createParabolImageUrl(hashedImageUrl))
    })

  return {updatedDescription: $.html(), imageUrlToHash}
}

export const downloadAndCacheImages = async (
  authToken: string,
  imageUrlToHash: Record<string, string>
) => {
  await Promise.all(
    Object.entries(imageUrlToHash).map(([imageUrl, hash]) =>
      downloadAndCacheImage(authToken, hash, imageUrl)
    )
  )
}

const createParabolImageUrl = (hashedImageUrl: string) => {
  return `/jira-attachements/${hashedImageUrl}`
}

const downloadAndCacheImage = async (
  authToken: string,
  hashedImageUrl: string,
  imageUrl: string
) => {
  const redis = getRedis()
  const isImageAlreadyCached = await redis.exists(hashedImageUrl)
  if (isImageAlreadyCached) return

  redis.setBuffer(hashedImageUrl, NO_IMAGE_BUFFER, 'PX', IMAGE_TTL_MS)
  const imageBuffer = await fetchImage(authToken, imageUrl)
  if (!imageBuffer) {
    await redis.del(hashedImageUrl)
    return
  }
  redis.setBuffer(hashedImageUrl, imageBuffer, 'PX', IMAGE_TTL_MS)
}

const fetchImage = async (authToken: string, url: string) => {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${authToken}`
    }
  })

  if (response.status !== 200) {
    console.warn('Fetching image failed', response.status)
    return null
  }

  return response.buffer()
}

const createImageUrlHash = (imageUrl: string) => {
  return toBase64url(
    crypto
      .createHmac('sha256', serverSecret)
      .update(imageUrl)
      .digest('base64')
  )
}

// https://en.wikipedia.org/wiki/Base64#The_URL_applications
// https://www.lytzen.name/2019/09/25/can-a-hash-have-a-slash.html
const toBase64url = (base64: string) => {
  return base64
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}
